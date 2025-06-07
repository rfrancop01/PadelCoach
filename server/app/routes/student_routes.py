from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt, get_jwt_identity
from ..models import Students, Users
from ..models import Sessions, SessionsStudents
from .. import db

student_routes = Blueprint('student_routes', __name__)

@student_routes.route('/', methods=['GET'])
@jwt_required()
def list_students():
    claims = get_jwt()
    if claims.get("role") not in ["admin", "trainer"]:
        return jsonify({"message": "Usuario no autorizado"}), 403

    students = db.session.execute(db.select(Students)).scalars()
    result = [s.serialize() for s in students]
    return jsonify({"message": "Lista de Alumnos", "results": result}), 200

@student_routes.route('/', methods=['POST'])
@jwt_required()
def create_student():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    level = data.get("level")
    user_id = data.get("user_id")
    if not level or not user_id:
        return jsonify({"message": "level and user_id are required"}), 400
    # Validar si el user_id ya está asociado a un alumno
    existing_student = db.session.scalar(db.select(Students).where(Students.user_id == user_id))
    if existing_student:
        return jsonify({"message": "Este usuario ya está registrado como alumno"}), 409
    new_student = Students(level=level, user_id=user_id)
    db.session.add(new_student)
    db.session.commit()
    return jsonify({"message": "Student created successfully", "results": new_student.serialize()}), 201

@student_routes.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_student(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    role = claims.get("role")

    student = db.session.get(Students, id)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    if role != "admin" and student.user_id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403

    user = db.session.get(Users, student.user_id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    result = {
        "id": student.id,
        "level": student.level,
        "user_id": student.user_id,
        "name": user.name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "is_active": user.is_active,
    }

    return jsonify({"message": f"Student {id} found", "results": result}), 200

@student_routes.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_student(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    role = claims.get("role")
    student = db.session.scalar(db.select(Students).where(Students.id == id))
    if not student:
        return jsonify({"message": "Student not found"}), 404
    if role != "admin" and student.user_id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    student.level = data.get("level", student.level)

    # Actualizar también datos del usuario
    user = db.session.get(Users, student.user_id)
    if user:
        user.name = data.get("name", user.name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        user.phone = data.get("phone", user.phone)
        if "is_active" in data:
            user.is_active = data["is_active"]

    db.session.commit()
    return jsonify({"message": f"Student {id} updated successfully", "results": student.serialize()}), 200

@student_routes.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_student(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    role = claims.get("role")
    student = db.session.get(Students, id)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    if role != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403

    user = db.session.get(Users, student.user_id)
    if user:
        user.is_active = False

    db.session.commit()
    return jsonify({"message": f"Student {id} deactivated successfully"}), 200


# Endpoint para obtener las sesiones de un estudiante


@student_routes.route('/<int:id>/sessions', methods=['GET'])
@jwt_required()
def get_student_sessions(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    role = claims.get("role")

    student = db.session.get(Students, id)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    if role != "admin" and student.user_id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403

    session_links = db.session.execute(
        db.select(SessionsStudents.session_id).where(SessionsStudents.student_id == id)
    ).scalars().all()

    sessions = db.session.execute(
        db.select(Sessions).where(Sessions.id.in_(session_links))
    ).scalars().all()

    result = [s.serialize() for s in sessions]

    return jsonify({"message": f"Sesiones del estudiante {id}", "results": result}), 200

@student_routes.route('/by_user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_student_by_user(user_id):
    claims = get_jwt()
    role = claims.get("role")
    current_user_id = claims.get("user_id")

    if role != "admin" and user_id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403

    student = db.session.scalar(db.select(Students).where(Students.user_id == user_id))
    if not student:
        return jsonify({"message": "Student not found"}), 404

    return jsonify({
        "message": f"Student {student.id} found",
        "results": student.serialize()
    }), 200