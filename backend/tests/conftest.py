"""
Configuração central de testes do PathUFES.

Define fixtures reutilizáveis entre todos os arquivos de teste:
- ``db_session``: sessão SQLite em memória, isolada por teste
- ``client``: cliente HTTP que chama os endpoints sem abrir porta de rede
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

# SQLite em memória: criado na RAM, destruído ao fechar a conexão.
# StaticPool garante que todas as sessões reutilizem a mesma conexão —
# obrigatório para que as tabelas criadas por uma sessão sejam visíveis
# nas outras dentro do mesmo teste.
SQLITE_URL = "sqlite:///:memory:"

engine_test = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionTest = sessionmaker(bind=engine_test, autocommit=False, autoflush=False)


@pytest.fixture()
def db_session():
    """
    Cria todas as tabelas, abre uma sessão e a destrói ao final do teste.

    O ``yield`` divide a fixture em setup (antes) e teardown (depois):
    tudo antes do yield prepara o recurso, tudo depois limpa.

    :return: Sessão SQLAlchemy apontando para SQLite em memória.
    :rtype: Session
    """
    Base.metadata.create_all(bind=engine_test)
    session = SessionTest()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine_test)


@pytest.fixture()
def client(db_session):
    """
    Cliente HTTP de teste com banco de dados substituído pela sessão de teste.

    Usa ``dependency_overrides`` do FastAPI para trocar o ``get_db`` real
    (que conecta no PostgreSQL) pela sessão SQLite do teste.

    :param db_session: Sessão de banco injetada pela fixture anterior.
    :return: Cliente HTTP para chamar os endpoints da API.
    :rtype: TestClient
    """
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
