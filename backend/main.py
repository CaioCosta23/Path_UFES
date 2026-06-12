"""
Módulo que importa biblioteca de gerenciamento da aplicação (API)
"""
from fastapi import FastAPI

# Cria uma instância da "aplicação" (onde será registrado os dados do 'back-end');
app = FastAPI()

# Registra requisições do tipo 'GET' no endereço indicado
@app.get("/api")

# Essa função deve ser comentada à partir do momento em que
# se for iniciar o projeto pois trata-se de um teste de funcionamento;
def root():
    """
    Função que retorna um resultado qualquer para teste de funcionamento da api.

    Returns:
        dict(): mensagem em formato JSON para verificar se a API está funcionando. 
    """
    return {"mensagem": "Backend FastAPI funcionando"}
