from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_supplements"
down_revision = "0001_users_sessions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "supplements",
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
            "source_type", sa.String(length=20), nullable=False, server_default="manual"
        ),
        sa.Column("product_name", sa.String(length=200), nullable=False),
        sa.Column("manufacturer", sa.String(length=200), nullable=True),
        sa.Column("serving_basis_type", sa.String(length=20), nullable=False),
        sa.Column("daily_serving_count", sa.Numeric(10, 2), nullable=True),
        sa.Column("memo", sa.Text(), nullable=True),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="active"
        ),
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
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "source_type in ('manual', 'ocr', 'hybrid')",
            name="ck_supplements_source_type",
        ),
        sa.CheckConstraint(
            "serving_basis_type in ('per_serving', 'per_day')",
            name="ck_supplements_serving_basis_type",
        ),
        sa.CheckConstraint(
            "status in ('active', 'analyzable', 'analysis_locked', 'archived', 'deleted')",
            name="ck_supplements_status",
        ),
    )
    op.create_index(
        "ix_supplements_user_id_deleted_at_updated_at",
        "supplements",
        ["user_id", "deleted_at", "updated_at"],
        unique=False,
    )
    op.create_index(
        "ix_supplements_user_id_status",
        "supplements",
        ["user_id", "status"],
        unique=False,
    )

    op.create_table(
        "supplement_ingredients",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "supplement_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("supplements.id"),
            nullable=False,
        ),
        sa.Column("ingredient_name_raw", sa.String(length=200), nullable=False),
        sa.Column("ingredient_name_standard", sa.String(length=200), nullable=True),
        sa.Column("ingredient_code", sa.String(length=100), nullable=True),
        sa.Column("amount_value", sa.Numeric(12, 4), nullable=False),
        sa.Column("amount_unit", sa.String(length=50), nullable=False),
        sa.Column(
            "is_primary_display_value",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "match_status",
            sa.String(length=30),
            nullable=False,
            server_default="unmatched",
        ),
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
            "match_status in ('matched', 'partial_matched', 'unmatched')",
            name="ck_supplement_ingredients_match_status",
        ),
    )
    op.create_index(
        "ix_supplement_ingredients_supplement_id",
        "supplement_ingredients",
        ["supplement_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_supplement_ingredients_supplement_id", table_name="supplement_ingredients"
    )
    op.drop_table("supplement_ingredients")

    op.drop_index("ix_supplements_user_id_status", table_name="supplements")
    op.drop_index(
        "ix_supplements_user_id_deleted_at_updated_at", table_name="supplements"
    )
    op.drop_table("supplements")
