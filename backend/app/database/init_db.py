from sqlalchemy import inspect, text

from app.database.base import Base
from app.database.session import engine
from app.models import Customer, InventoryTransaction, Product, Supplier, User


def ensure_inventory_transaction_schema() -> None:
    inspector = inspect(engine)
    if "inventory_transactions" not in inspector.get_table_names():
        return

    column_names = {
        column["name"] for column in inspector.get_columns("inventory_transactions")
    }
    if "quantity_changed" not in column_names and "quantity_change" in column_names:
        with engine.begin() as connection:
            if engine.dialect.name == "mysql":
                connection.execute(
                    text(
                        "ALTER TABLE inventory_transactions "
                        "CHANGE COLUMN quantity_change quantity_changed INT NOT NULL"
                    )
                )
            else:
                connection.execute(
                    text(
                        "ALTER TABLE inventory_transactions "
                        "RENAME COLUMN quantity_change TO quantity_changed"
                    )
                )

    with engine.begin() as connection:
        connection.execute(
            text(
                "UPDATE inventory_transactions "
                "SET transaction_type = 'IN' "
                "WHERE transaction_type = 'increase'"
            )
        )
        connection.execute(
            text(
                "UPDATE inventory_transactions "
                "SET transaction_type = 'OUT' "
                "WHERE transaction_type = 'decrease'"
            )
        )


def init_db() -> None:
    # Importing models above registers their metadata before create_all runs.
    _ = (Customer, InventoryTransaction, Product, Supplier, User)
    Base.metadata.create_all(bind=engine)
    ensure_inventory_transaction_schema()
