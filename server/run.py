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
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # <-- Importa flask_cors

from config import Config
from app import db
from app.models import Users, Students, Trainers, Courts, Sessions, SessionsStudents

class CustomUserAdmin(ModelView):
    form_excluded_columns = ('created_at', 'password_hash')

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    jwt = JWTManager(app)
    logging.basicConfig(level=logging.INFO)

    db.init_app(app)
    migrate = Migrate(app, db, directory=os.path.join(app.root_path, 'migrations'))

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    admin = Admin(app, name='Admin Panel', url='/admin', template_mode='bootstrap3')
    admin.add_view(CustomUserAdmin(Users, db.session))
    admin.add_view(ModelView(Students, db.session))
    admin.add_view(ModelView(Trainers, db.session))
    admin.add_view(ModelView(Courts, db.session))
    admin.add_view(ModelView(Sessions, db.session))
    admin.add_view(ModelView(SessionsStudents, db.session))

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'),
                                   'favicon.ico', mimetype='image/vnd.microsoft.icon')

    return app

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