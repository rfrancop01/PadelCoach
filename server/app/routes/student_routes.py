

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt, get_jwt_identity
from ..models import Students, Users
from .. import db

student_routes = Blueprint('student_routes', __name__)

@student_routes.route('/api/students', methods=['GET'])
@jwt_required()
def list_students():
    claims = get_jwt()
    if claims.get("role") not in ["admin", "trainer"]:
        return jsonify({"message": "Usuario no autorizado"}), 403
    students = db.session.execute(db.select(Students)).scalars()
    result = []
    for student in students:
        data = student.serialize()
        data.pop('user_id', None)
        data.pop('is_active', None)
        user = db.session.get(Users, student.user_id)
        data['user'] = user.serialize() if user else None
        result.append(data)
    return jsonify({"message": "Lista de estudiantes", "results": result}), 200

@student_routes.route('/api/students', methods=['POST'])
@jwt_required()
def create_student():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    level = data.get("level")
    age = data.get("age")
    user_id = data.get("user_id")
    if not level or not age or not user_id:
        return jsonify({"message": "level, age and user_id are required"}), 400
    new_student = Students(level=level, age=age, user_id=user_id)
    db.session.add(new_student)
    db.session.commit()
    return jsonify({"message": "Student created successfully", "results": new_student.serialize()}), 201

@student_routes.route('/api/students/<int:id>', methods=['GET'])
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
    data = student.serialize()
    data.pop('user_id', None)
    data.pop('is_active', None)
    return jsonify({"message": f"Student {id} found", "results": data}), 200

@student_routes.route('/api/students/<int:id>', methods=['PUT'])
@jwt_required()
def update_student(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    role = claims.get("role")
    student = db.session.get(Students, id)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    if role != "admin" and student.user_id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    student.level = data.get("level", student.level)
    student.age = data.get("age", student.age)
    if "is_active" in data:
        student.is_active = data["is_active"]
    db.session.commit()
    return jsonify({"message": f"Student {id} updated successfully", "results": student.serialize()}), 200

@student_routes.route('/api/students/<int:id>', methods=['DELETE'])
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
    student.is_active = False
    db.session.commit()
    return jsonify({"message": f"Student {id} deactivated successfully"}), 200