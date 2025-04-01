from flask import Blueprint, request, jsonify
from . import db
from .models import Users

api = Blueprint('api', __name__)

@api.route("/users", methods=["POST"])
def add_user():
    data = request.get_json()  # Recibe el JSON enviado al endpoint
    
    # Crear un nuevo usuario
    new_user = Users(name=data["name"], last_name=data["last_name"], email=data["email"], role=data["role"])
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"Usuario {new_user.name} creado exitosamente!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al crear el usuario: {str(e)}"}), 500