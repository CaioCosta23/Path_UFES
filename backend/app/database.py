from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", 
                        "postgresql://postgres:senha123@localhost:5432/pathufes")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Gera uma sessão de banco de dados para injeção de dependência no FastAPI.

    Abre uma sessão do SQLAlchemy, cede ao endpoint e a fecha ao término
    da requisição, garantindo que conexões não fiquem abertas indefinidamente.

    :return: Sessão SQLAlchemy ativa.
    :rtype: Session
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
