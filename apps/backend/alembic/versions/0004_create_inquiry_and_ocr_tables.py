from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_inquiry_ocr"
down_revision = "0003_analysis"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "inquiries",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("inquiry_type", sa.String(length=30), nullable=False),
        sa.Column(
            "related_analysis_run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("analysis_runs.id"),
            nullable=True,
        ),
        sa.Column(
            "related_supplement_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("supplements.id"),
            nullable=True,
        ),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="received"
        ),
        sa.Column("admin_note", sa.Text(), nullable=True),
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
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "inquiry_type in ('general', 'error_report', 'analysis', 'supplement', 'account')",
            name="ck_inquiries_type",
        ),
        sa.CheckConstraint(
            "status in ('received', 'in_progress', 'resolved', 'closed')",
            name="ck_inquiries_status",
        ),
    )
    op.create_index(
        "ix_inquiries_user_id_status_created_at",
        "inquiries",
        ["user_id", "status", "created_at"],
        unique=False,
    )

    op.create_table(
        "admin_action_logs",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "admin_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("action_type", sa.String(length=50), nullable=False),
        sa.Column("target_type", sa.String(length=50), nullable=False),
        sa.Column("target_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column(
            "before_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("after_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("request_id", sa.String(length=100), nullable=True),
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
    )
    op.create_index(
        "ix_admin_action_logs_admin_user_id_created_at",
        "admin_action_logs",
        ["admin_user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_admin_action_logs_target_type_target_id",
        "admin_action_logs",
        ["target_type", "target_id"],
        unique=False,
    )

    op.create_table(
        "supplement_ocr_jobs",
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
            "linked_supplement_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("supplements.id"),
            nullable=True,
        ),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="uploaded"
        ),
        sa.Column("source_file_key", sa.String(length=500), nullable=False),
        sa.Column("source_file_name", sa.String(length=255), nullable=False),
        sa.Column("source_mime_type", sa.String(length=100), nullable=False),
        sa.Column("source_file_size_bytes", sa.BigInteger(), nullable=False),
        sa.Column(
            "extracted_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("error_code", sa.String(length=50), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("source_deleted_at", sa.DateTime(timezone=True), nullable=True),
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
            "status in ('uploaded', 'queued', 'processing', 'succeeded', 'failed', 'confirmed', 'canceled')",
            name="ck_supplement_ocr_jobs_status",
        ),
    )
    op.create_index(
        "ix_supplement_ocr_jobs_user_id_status_created_at",
        "supplement_ocr_jobs",
        ["user_id", "status", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_supplement_ocr_jobs_linked_supplement_id",
        "supplement_ocr_jobs",
        ["linked_supplement_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_supplement_ocr_jobs_linked_supplement_id", table_name="supplement_ocr_jobs"
    )
    op.drop_index(
        "ix_supplement_ocr_jobs_user_id_status_created_at",
        table_name="supplement_ocr_jobs",
    )
    op.drop_table("supplement_ocr_jobs")

    op.drop_index(
        "ix_admin_action_logs_target_type_target_id", table_name="admin_action_logs"
    )
    op.drop_index(
        "ix_admin_action_logs_admin_user_id_created_at", table_name="admin_action_logs"
    )
    op.drop_table("admin_action_logs")

    op.drop_index("ix_inquiries_user_id_status_created_at", table_name="inquiries")
    op.drop_table("inquiries")
