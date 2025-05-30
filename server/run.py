import warnings
from sqlalchemy.exc import SAWarning

# Always show SQLAlchemy warnings
warnings.simplefilter('always', SAWarning)

import os
import logging
import click

from flask import Flask, send_from_directory
from flask.cli import with_appcontext
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # <-- Importa flask_cors

from config import Config
from app import db, create_app
from app.models import Users, Students, Trainers, Courts, Sessions, SessionsStudents

app = create_app()

@app.cli.command("reset_db")
def reset_db():
    if app.config.get("ENV") != "development":
        if not click.confirm("No estás en un entorno de desarrollo. ¿Estás seguro de que deseas resetear la base de datos?"):
            click.echo("Operación abortada.")
            return
    db.drop_all()  # Borra todas las tablas
    db.create_all()  # Crea las tablas nuevamente
    logging.info("Base de datos reseteada con éxito")

@app.cli.command("create-admin")
@with_appcontext
def create_admin():
    email = input("Email: ")
    password = input("Password: ")
    existing = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if existing:
        print("El usuario ya existe.")
        return
    user = Users(
        email=email,
        name="Admin",
        last_name="User",
        phone="000000000",
        role="admin",
        is_active=True
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    print(f"Usuario admin creado: {email}")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=True)