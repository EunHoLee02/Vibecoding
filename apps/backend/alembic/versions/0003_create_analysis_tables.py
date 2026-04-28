from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003_analysis"
down_revision = "0002_supplements"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analysis_previews",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "preview_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column(
            "validation_summary",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "ready_for_analysis",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("preview_status", sa.String(length=30), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint(
            "preview_status in ('ready', 'invalid')", name="ck_analysis_previews_status"
        ),
    )

    op.create_table(
        "analysis_runs",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "confirmed_preview_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("analysis_previews.id"),
            nullable=False,
        ),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="pending"
        ),
        sa.Column("fingerprint", sa.String(length=255), nullable=False),
        sa.Column(
            "purpose_codes",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "is_reused_result",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("reuse_reason", sa.String(length=50), nullable=True),
        sa.Column("summary_level", sa.String(length=30), nullable=True),
        sa.Column("summary_title", sa.String(length=200), nullable=True),
        sa.Column("summary_message", sa.String(length=1000), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status in ('pending', 'processing', 'completed', 'partial_completed', 'failed')",
            name="ck_analysis_runs_status",
        ),
    )
    op.create_index(
        "ix_analysis_runs_user_id_status",
        "analysis_runs",
        ["user_id", "status"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_runs_user_id_created_at",
        "analysis_runs",
        ["user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_runs_fingerprint", "analysis_runs", ["fingerprint"], unique=False
    )

    op.create_table(
        "analysis_result_items",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "analysis_run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("analysis_runs.id"),
            nullable=False,
        ),
        sa.Column("ingredient_name_standard", sa.String(length=200), nullable=False),
        sa.Column("total_amount", sa.Numeric(12, 4), nullable=False),
        sa.Column("amount_unit", sa.String(length=50), nullable=False),
        sa.Column(
            "duplication_count", sa.Integer(), nullable=False, server_default="1"
        ),
        sa.Column("risk_level", sa.String(length=30), nullable=False),
        sa.Column("recommendation_level", sa.String(length=30), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint(
            "risk_level in ('low', 'medium', 'high')",
            name="ck_analysis_result_items_risk_level",
        ),
        sa.CheckConstraint(
            "recommendation_level in ('reduce', 'maintain', 'review')",
            name="ck_analysis_result_items_recommendation_level",
        ),
    )
    op.create_index(
        "ix_analysis_result_items_analysis_run_id",
        "analysis_result_items",
        ["analysis_run_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_analysis_result_items_analysis_run_id", table_name="analysis_result_items"
    )
    op.drop_table("analysis_result_items")

    op.drop_index("ix_analysis_runs_fingerprint", table_name="analysis_runs")
    op.drop_index("ix_analysis_runs_user_id_created_at", table_name="analysis_runs")
    op.drop_index("ix_analysis_runs_user_id_status", table_name="analysis_runs")
    op.drop_table("analysis_runs")

    op.drop_table("analysis_previews")
