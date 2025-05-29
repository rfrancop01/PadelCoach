#!/bin/sh
set -e

echo "[entrypoint.sh] Ejecutando migraciones y creación admin..."

python init_db.py

echo "[entrypoint.sh] Migraciones y admin completados. Lanzando app..."

exec python run.py