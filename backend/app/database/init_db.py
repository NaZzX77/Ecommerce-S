from app.database.base import Base
from app.database.session import engine
from app.models import Product, User


def init_db() -> None:
    # Importing models above registers their metadata before create_all runs.
    _ = (Product, User)
    Base.metadata.create_all(bind=engine)
