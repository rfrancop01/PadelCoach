from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

from config import Config


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Configuración general
    app.config.from_object(Config)
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'app', 'static', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # Tamaño máximo de 2MB

    # Asegurarse de que la carpeta de uploads exista
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    app.url_map.strict_slashes = False
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Inicialización de extensiones
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Importación de rutas
    from .routes.auth_routes import auth_routes
    from .routes.court_routes import court_routes
    from .routes.invitation_routes import invitation_routes
    from .routes.session_routes import session_routes
    from .routes.session_student_routes import session_student_routes
    from .routes.student_routes import student_routes
    from .routes.trainer_routes import trainer_routes
    from .routes.trainingplan_routes import trainingplan_routes
    from .routes.user_routes import user_routes

    # Registro de Blueprints (orden alfabético)
    app.register_blueprint(auth_routes, url_prefix='/api/auth')
    app.register_blueprint(court_routes, url_prefix='/api/courts')
    app.register_blueprint(invitation_routes, url_prefix='/api/invitations')
    app.register_blueprint(session_routes, url_prefix='/api/sessions')
    app.register_blueprint(session_student_routes, url_prefix='/api/session_students')
    app.register_blueprint(student_routes, url_prefix='/api/students')
    app.register_blueprint(trainer_routes, url_prefix='/api/trainers')
    app.register_blueprint(trainingplan_routes, url_prefix='/api/trainingplans')
    app.register_blueprint(user_routes, url_prefix='/api/users')

    # Ruta para servir archivos subidos
    @app.route('/static/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app