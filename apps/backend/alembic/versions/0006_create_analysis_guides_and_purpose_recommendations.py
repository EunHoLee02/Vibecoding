from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0006_analysis_guides"
down_revision = "0005_password_reset"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analysis_guides",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "analysis_run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("analysis_runs.id"),
            nullable=False,
        ),
        sa.Column("guide_type", sa.String(length=30), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("risk_level", sa.String(length=30), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="1"),
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
            "guide_type in ('timing', 'positive_combination', 'caution_combination')",
            name="ck_analysis_guides_guide_type",
        ),
        sa.CheckConstraint(
            "risk_level is null or risk_level in ('low', 'medium', 'high')",
            name="ck_analysis_guides_risk_level",
        ),
    )
    op.create_index(
        "ix_analysis_guides_analysis_run_id_display_order",
        "analysis_guides",
        ["analysis_run_id", "display_order"],
        unique=False,
    )

    op.create_table(
        "analysis_purpose_recommendations",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "analysis_run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("analysis_runs.id"),
            nullable=False,
        ),
        sa.Column("purpose_code", sa.String(length=100), nullable=False),
        sa.Column("purpose_title", sa.String(length=200), nullable=False),
        sa.Column("fit_summary", sa.Text(), nullable=False),
        sa.Column("recommendation_level", sa.String(length=30), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="1"),
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
            "recommendation_level in ('reduce', 'maintain', 'review')",
            name="ck_analysis_purpose_recommendations_recommendation_level",
        ),
        sa.UniqueConstraint(
            "analysis_run_id",
            "purpose_code",
            name="uq_analysis_purpose_recommendations_run_id_purpose_code",
        ),
    )
    op.create_index(
        "ix_analysis_purpose_recommendations_run_id_display_order",
        "analysis_purpose_recommendations",
        ["analysis_run_id", "display_order"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_purpose_recommendations_run_id_purpose_code",
        "analysis_purpose_recommendations",
        ["analysis_run_id", "purpose_code"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_analysis_purpose_recommendations_run_id_purpose_code",
        table_name="analysis_purpose_recommendations",
    )
    op.drop_index(
        "ix_analysis_purpose_recommendations_run_id_display_order",
        table_name="analysis_purpose_recommendations",
    )
    op.drop_table("analysis_purpose_recommendations")

    op.drop_index(
        "ix_analysis_guides_analysis_run_id_display_order",
        table_name="analysis_guides",
    )
    op.drop_table("analysis_guides")
