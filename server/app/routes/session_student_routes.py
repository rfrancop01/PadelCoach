from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import SessionsStudents, Students
from .. import db

session_student_routes = Blueprint('session_student_routes', __name__)

@session_student_routes.route('/', methods=['GET'])
@jwt_required()
def list_session_students():
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")

    if role == "admin":
        ss_records = db.session.execute(db.select(SessionsStudents)).scalars()
    else:
        student_ids = db.session.execute(
            db.select(Students.id).where(Students.user_id == user_id)
        ).scalars()
        ss_records = db.session.execute(
            db.select(SessionsStudents).where(SessionsStudents.student_id.in_(student_ids))
        ).scalars()

    result = [ss.serialize() for ss in ss_records]
    return jsonify({"message": "Lista de sesiones-alumnos", "results": result}), 200

@session_student_routes.route('/', methods=['POST'])
@jwt_required()
def create_session_student():
    data = request.json
    session_id = data.get("session_id")
    student_id = data.get("student_id")
    if not session_id or not student_id:
        return jsonify({"message": "session_id and student_id are required"}), 400
    new_ss = SessionsStudents(session_id=session_id, student_id=student_id)
    db.session.add(new_ss)
    db.session.commit()
    return jsonify({"message": "SessionStudent created successfully", "results": new_ss.serialize()}), 201

@session_student_routes.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_session_student(id):
    ss = db.session.get(SessionsStudents, id)
    if not ss:
        return jsonify({"message": "SessionStudent not found"}), 404
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")
    student = db.session.get(Students, ss.student_id)
    if role != "admin" and (not student or student.user_id != user_id):
        return jsonify({"message": "No autorizado para ver esta relación"}), 403
    return jsonify({"message": f"SessionStudent {id} found", "results": ss.serialize()}), 200

@session_student_routes.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_session_student(id):
    ss = db.session.get(SessionsStudents, id)
    if not ss:
        return jsonify({"message": "SessionStudent not found"}), 404
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")
    student = db.session.get(Students, ss.student_id)
    if role != "admin":
        return jsonify({"message": "No autorizado para modificar esta relación"}), 403
    data = request.json
    ss.session_id = data.get("session_id", ss.session_id)
    ss.student_id = data.get("student_id", ss.student_id)
    db.session.commit()
    return jsonify({"message": f"SessionStudent {id} updated successfully", "results": ss.serialize()}), 200

@session_student_routes.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_session_student(id):
    ss = db.session.get(SessionsStudents, id)
    if not ss:
        return jsonify({"message": "SessionStudent not found"}), 404
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")
    student = db.session.get(Students, ss.student_id)
    if role != "admin":
        return jsonify({"message": "No autorizado para eliminar esta relación"}), 403
    db.session.delete(ss)
    db.session.commit()
    return jsonify({"message": f"SessionStudent {id} deleted successfully"}), 200