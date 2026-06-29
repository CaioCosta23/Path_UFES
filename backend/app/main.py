"""
Aplicação FastAPI do PathUFES.

Ponto de entrada do backend. Registra os routers e configura o CORS
para permitir requisições do frontend React em desenvolvimento.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import disciplinas, alunos

app = FastAPI(
    title="PathUFES API",
    description="API de planejamento acadêmico baseado em grafos para alunos de CC da UFES.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # porta padrão do Vite
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(disciplinas.router)
app.include_router(alunos.router)


@app.get("/", tags=["health"])
def health_check():
    """
    Verifica se a API está no ar.

    :return: Mensagem de status.
    :rtype: dict
    """
    return {"status": "ok", "app": "PathUFES"}
