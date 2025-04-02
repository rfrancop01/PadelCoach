"""empty message

Revision ID: 2be35ff6a1bf
Revises: cee1277b0323
Create Date: 2025-04-02 13:58:14.788723

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2be35ff6a1bf'
down_revision = 'cee1277b0323'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('role',
               existing_type=postgresql.ENUM('Admin', 'Trainer', 'Student', name='role_enum'),
               type_=sa.String(length=20),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('role',
               existing_type=sa.String(length=20),
               type_=postgresql.ENUM('Admin', 'Trainer', 'Student', name='role_enum'),
               existing_nullable=False)

    # ### end Alembic commands ###
