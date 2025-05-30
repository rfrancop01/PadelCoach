from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
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

    from .routes.auth_routes import auth_routes
    from .routes.user_routes import user_routes
    from .routes.student_routes import student_routes
    from .routes.trainer_routes import trainer_routes
    from .routes.court_routes import court_routes
    from .routes.session_routes import session_routes
    from .routes.session_student_routes import session_student_routes
    from .routes.invitation_routes import invitation_routes
    from .routes.trainingplan_routes import trainingplan_routes

    app.register_blueprint(auth_routes, url_prefix='/api/auth')
    app.register_blueprint(user_routes, url_prefix='/api/users')
    app.register_blueprint(student_routes, url_prefix='/api/students')
    app.register_blueprint(trainer_routes, url_prefix='/api/trainers')
    app.register_blueprint(court_routes, url_prefix='/api/courts')
    app.register_blueprint(session_routes, url_prefix='/api/sessions')
    app.register_blueprint(session_student_routes, url_prefix='/api/session_students')
    app.register_blueprint(invitation_routes, url_prefix='/api/invitations')
    app.register_blueprint(trainingplan_routes, url_prefix='/api/trainingplans')

    return app