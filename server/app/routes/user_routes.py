from flask import Blueprint, request, jsonify, url_for
from flask_jwt_extended import jwt_required, get_jwt
from ..models import Users
from ..models import Students
from .. import db

import os
from werkzeug.utils import secure_filename
from flask import current_app

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


@user_routes.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_user(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    user = db.session.get(Users, id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if claims.get("role") != "admin" and user.id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403

    # Determinar el origen de los datos (form-data o JSON)
    if request.content_type.startswith("multipart/form-data"):
        data = request.form
    else:
        data = request.json

    # Campos de texto
    user.name = data.get("name", user.name)
    user.last_name = data.get("last_name", user.last_name)
    user.phone = data.get("phone", user.phone)
    if "age" in data:
        try:
            user.age = int(data["age"])
        except (ValueError, TypeError):
            return jsonify({"message": "Edad inválida"}), 400
    if "is_active" in data and user.id != current_user_id:
        user.is_active = data["is_active"]
    if "role" in data:
        allowed_roles = {"admin", "trainer", "student"}
        if data["role"] not in allowed_roles:
            return jsonify({"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}), 400
        user.role = data["role"]

    # Procesar archivo de foto si viene en form-data
    photo_file = request.files.get("photo")
    if photo_file and photo_file.filename != "":
        filename = f"user_{user.id}_" + secure_filename(photo_file.filename)
        save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        photo_file.save(save_path)
        user.photo_url = filename

    db.session.commit()

    # Construir respuesta JSON, incluyendo URL pública de la foto
    result = user.serialize()
    if user.photo_url:
        result["photo_url"] = url_for("uploaded_file", filename=user.photo_url)
    return jsonify({"message": f"User {id} updated successfully", "results": result}), 200

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
# Nueva ruta para subir foto de usuario
@user_routes.route('/<int:id>/upload-photo', methods=['POST'])
@jwt_required()
def upload_user_photo(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    user = db.session.get(Users, id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    if claims.get("role") != "admin" and user.id != current_user_id:
        return jsonify({"message": "No autorizado"}), 403

    if 'photo' not in request.files:
        return jsonify({"message": "No se encontró archivo en la solicitud"}), 400

    photo = request.files['photo']
    if photo.filename == '':
        return jsonify({"message": "Nombre de archivo vacío"}), 400

    filename = secure_filename(photo.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    photo.save(file_path)

    user.photo_url = f"/uploads/{filename}"
    db.session.commit()

    return jsonify({"message": "Foto actualizada correctamente", "results": user.serialize()}), 200


@user_routes.route('/available-students', methods=['GET'])
@jwt_required()
def get_available_students():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403

    subquery = db.select(Students.user_id).subquery()
    available_users = db.session.execute(
        db.select(Users)
        .where(Users.role == "student")
        .where(Users.id.not_in(subquery))
    ).scalars().all()

    return jsonify({
        "message": "Usuarios disponibles para asignar como estudiantes",
        "results": [user.serialize() for user in available_users]
    }), 200