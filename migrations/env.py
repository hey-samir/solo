from logging.config import fileConfig

from flask import current_app
from alembic import context

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def get_engine():
    return current_app.extensions['migrate'].db.get_engine()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    
    with current_app.app_context():
        connectable = get_engine()

        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=current_app.extensions['migrate'].db.metadata,
                compare_type=True
            )

            with context.begin_transaction():
                context.run_migrations()

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=current_app.extensions['migrate'].db.metadata,
        literal_binds=True,
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
