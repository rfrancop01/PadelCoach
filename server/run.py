from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from app import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

from app.routes import api
app.register_blueprint(api, url_prefix='/api')

@app.cli.command("reset_db")
def reset_db():
    db.drop_all()  # Borra todas las tablas
    db.create_all()  # Crea las tablas nuevamente
    print("Base de datos reseteada con éxito")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)