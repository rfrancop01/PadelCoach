from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import Courts, Sessions
from .. import db

court_routes = Blueprint('court_routes', __name__)

@court_routes.route('/api/courts', methods=['GET'])
@jwt_required()
def list_courts():
    claims = get_jwt()
    role = claims.get("role")
    user_id = claims.get("user_id")

    if role == "admin":
        courts = db.session.execute(db.select(Courts)).scalars()
    else:
        from ..models import Sessions
        if role == "trainer":
            sessions = db.session.execute(db.select(Sessions).where(Sessions.trainer_id == user_id)).scalars()
        elif role == "student":
            from ..models import SessionsStudents, Students
            student = db.session.execute(db.select(Students).where(Students.user_id == user_id)).scalar()
            if not student:
                return jsonify({"message": "Student record not found"}), 404
            ss = db.session.execute(db.select(SessionsStudents).where(SessionsStudents.student_id == student.id)).scalars()
            session_ids = [s.session_id for s in ss]
            sessions = db.session.execute(db.select(Sessions).where(Sessions.id.in_(session_ids))).scalars()
        else:
            return jsonify({"message": "Usuario no autorizado"}), 403

        court_ids = set(s.court_id for s in sessions)
        courts = db.session.execute(db.select(Courts).where(Courts.id.in_(court_ids))).scalars()

    result = [court.serialize() for court in courts]
    return jsonify({"message": "Lista de canchas", "results": result}), 200

@court_routes.route('/api/courts', methods=['POST'])
@jwt_required()
def create_court():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    name = data.get("name")
    court_type = data.get("court_type")
    location = data.get("location")
    if not name or not court_type or not location:
        return jsonify({"message": "name, court type and location are required"}), 400
    new_court = Courts(name=name, court_type=court_type, location=location)
    db.session.add(new_court)
    db.session.commit()
    return jsonify({"message": "Court created successfully", "results": new_court.serialize()}), 201

@court_routes.route('/api/courts/<int:id>', methods=['GET'])
@jwt_required()
def get_court(id):
    claims = get_jwt()
    role = claims.get("role")
    user_id = claims.get("user_id")

    court = db.session.get(Courts, id)
    if not court:
        return jsonify({"message": "Court not found"}), 404

    if role != "admin":
        from ..models import Sessions, SessionsStudents, Students
        if role == "trainer":
            sessions = db.session.execute(db.select(Sessions).where(Sessions.court_id == id, Sessions.trainer_id == user_id)).scalars()
        elif role == "student":
            student = db.session.execute(db.select(Students).where(Students.user_id == user_id)).scalar()
            if not student:
                return jsonify({"message": "Student record not found"}), 404
            ss = db.session.execute(db.select(SessionsStudents).where(SessionsStudents.student_id == student.id)).scalars()
            session_ids = [s.session_id for s in ss]
            sessions = db.session.execute(db.select(Sessions).where(Sessions.court_id == id, Sessions.id.in_(session_ids))).scalars()
        else:
            return jsonify({"message": "Usuario no autorizado"}), 403

        if not any(True for _ in sessions):
            return jsonify({"message": "Usuario no autorizado para ver esta cancha"}), 403

    sessions = db.session.execute(db.select(Sessions).where(Sessions.court_id == id)).scalars()
    sessions_data = []
    for s in sessions:
        d = s.serialize()
        d.pop('court_id', None)
        d.pop('notes', None)
        sessions_data.append(d)
    data = court.serialize()
    data['sessions'] = sessions_data
    return jsonify({"message": f"Court {id} found", "results": data}), 200

@court_routes.route('/api/courts/<int:id>', methods=['PUT'])
@jwt_required()
def update_court(id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    court = db.session.get(Courts, id)
    if not court:
        return jsonify({"message": "Court not found"}), 404
    data = request.json
    court.name = data.get("name", court.name)
    court.court_type = data.get("court_type", court.court_type)
    court.location = data.get("location", court.location)
    db.session.commit()
    return jsonify({"message": f"Court {id} updated successfully", "results": court.serialize()}), 200

@court_routes.route('/api/courts/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_court(id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    court = db.session.get(Courts, id)
    if not court:
        return jsonify({"message": "Court not found"}), 404
    db.session.delete(court)
    db.session.commit()
    return jsonify({"message": f"Court {id} deleted successfully"}), 200