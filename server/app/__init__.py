from flask import Flask
from flask import Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restx import Api  # Añadido
from flask_jwt_extended import JWTManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    authorizations = {
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'Añade "Bearer <token>" aquí'
        }
    }

    blueprint = Blueprint('api', __name__, url_prefix='/api')

    api = Api(
        blueprint,
        version='1.0',
        title='PadelCoach API',
        description='API para gestión de sesiones de padel',
        doc='/docs',
        authorizations=authorizations,
        security=[{'Bearer': []}]
    )

    # Importar y registrar Namespaces
    from .routes import (
        auth_ns,
        users_ns,
        students_ns,
        trainers_ns,
        courts_ns,
        sessions_ns,
        ss_ns,
        invitations_ns
    )

    api.add_namespace(auth_ns, path='/auth')
    api.add_namespace(users_ns, path='/users')
    api.add_namespace(students_ns, path='/students')
    api.add_namespace(trainers_ns, path='/trainers')
    api.add_namespace(courts_ns, path='/courts')
    api.add_namespace(sessions_ns, path='/sessions')
    api.add_namespace(ss_ns, path='/session-students')
    api.add_namespace(invitations_ns, path='/invitations')

    app.register_blueprint(blueprint)
    return app