from app.database.base import Base
from app.database.session import engine
from app.models import User


def init_db() -> None:
    # Importing User above registers the model metadata before create_all runs.
    _ = User
    Base.metadata.create_all(bind=engine)

