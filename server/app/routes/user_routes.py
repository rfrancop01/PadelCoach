

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import Users
from .. import db

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/', methods=['GET'])
@jwt_required()
def list_users():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    users = db.session.execute(db.select(Users)).scalars()
    return jsonify({
        "message": "Lista de usuarios",
        "results": [user.serialize() for user in users]
    }), 200

@user_routes.route('/', methods=['POST'])
@jwt_required()
def create_user():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    role = data.get("role", "student")
    allowed_roles = {"admin", "trainer", "student"}
    if role not in allowed_roles:
        return jsonify({"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}), 400
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", "")
    last_name = data.get("last_name", "")
    phone = data.get("phone", "")
    if not email or not password:
        return jsonify({"message": "Email y password son requeridos"}), 400
    existing = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if existing:
        return jsonify({"message": "El usuario ya existe"}), 409
    new_user = Users(
        email=email,
        name=name,
        last_name=last_name,
        phone=phone,
        role=role,
        is_active=True
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Usuario creado exitosamente", "results": new_user.serialize()}), 201

@user_routes.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    user = db.session.get(Users, id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if claims.get("role") != "admin" and user.id != current_user_id:
        return jsonify({"message": "Unauthorized access"}), 403
    return jsonify({"message": f"User {id} found", "results": user.serialize()}), 200

@user_routes.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    user = db.session.get(Users, id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if claims.get("role") != "admin" and user.id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    user.name = data.get("name", user.name)
    user.last_name = data.get("last_name", user.last_name)
    user.phone = data.get("phone", user.phone)
    if "is_active" in data and user.id != current_user_id:
        user.is_active = data["is_active"]
    if "role" in data:
        allowed_roles = {"admin", "trainer", "student"}
        if data["role"] not in allowed_roles:
            return jsonify({"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}), 400
        user.role = data["role"]
    db.session.commit()
    return jsonify({"message": f"User {id} updated successfully", "results": user.serialize()}), 200

@user_routes.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    user = db.session.get(Users, id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if user.id == current_user_id:
        return jsonify({"message": "No puedes desactivarte a ti mismo"}), 403
    user.is_active = False
    db.session.commit()
    return jsonify({"message": f"User {id} deactivated successfully"}), 200