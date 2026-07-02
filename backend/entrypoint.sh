#!/bin/bash
set -e

echo "[entrypoint] Aguardando banco de dados..."
until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    echo "[entrypoint] Banco indisponível — tentando novamente em 2s..."
    sleep 2
done

echo "[entrypoint] Aplicando migrations..."
alembic upgrade head

echo "[entrypoint] Populando banco..."
python scripts/seed_db.py

echo "[entrypoint] Iniciando servidor..."
exec fastapi run app/main.py --port 8000
