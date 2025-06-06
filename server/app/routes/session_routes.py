from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from ..models import Sessions, SessionsStudents, Students, Users, Courts, Trainers
from sqlalchemy import extract, func
from datetime import datetime
from .. import db


session_routes = Blueprint('session_routes', __name__)

# Función para comprobar conflictos
def check_conflicts(session_id, date, time, court_id, student_ids):
    conflicting_students = []
    for student_id in student_ids:
        q = db.session.query(SessionsStudents).join(Sessions).filter(
            SessionsStudents.student_id == student_id,
            Sessions.date == date,
            Sessions.time == time
        )
        if session_id:
            q = q.filter(Sessions.id != session_id)
        if q.first():
            student = db.session.get(Students, student_id)
            user = db.session.get(Users, student.user_id) if student else None
            full_name = f"{user.name} {user.last_name}" if user else f"ID {student_id}"
            conflicting_students.append(full_name)

    q_court = db.session.query(Sessions).filter(
        Sessions.court_id == court_id,
        Sessions.date == date,
        Sessions.time == time
    )
    if session_id:
        q_court = q_court.filter(Sessions.id != session_id)
    court_conflict = q_court.first() is not None

    return conflicting_students, court_conflict

@session_routes.route('/', methods=['GET'])
@jwt_required()
def list_sessions():
    claims = get_jwt()
    role = claims.get("role")
    if role != "admin":
        return jsonify({"message": "Solo los administradores pueden listar todas las sesiones"}), 403
    sessions = db.session.execute(db.select(Sessions)).scalars()
    result = []
    for session in sessions:
        data = {
            "id": session.id,
            "date": session.date.strftime("%d/%m/%Y") if session.date else None,
            "time": session.time if isinstance(session.time, str) else session.time.strftime("%H:%M") if session.time else None,
            "notes": session.notes,
            "court": db.session.get(Courts, session.court_id).serialize() if session.court_id else None,
            "trainer": db.session.get(Users, db.session.get(Trainers, session.trainer_id).user_id).serialize() if session.trainer_id else None
        }
        associations = db.session.execute(
            db.select(SessionsStudents).where(SessionsStudents.session_id == session.id)
        ).scalars()
        students_list = []
        for assoc in associations:
            student = db.session.get(Students, assoc.student_id)
            if student:
                user = db.session.get(Users, student.user_id)
                student_data = student.serialize()
                student_data['user'] = user.serialize() if user else None
                student_data.pop('user_id', None)
                student_data.pop('is_active', None)
                students_list.append(student_data)
        data['students'] = students_list
        result.append(data)
    return jsonify({"message": "Lista de sesiones", "results": result}), 200

@session_routes.route('/', methods=['POST'])
@jwt_required()
def create_session():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado para crear sesiones"}), 403
    data = request.json
    from ..models import Trainers
    trainer_id = int(data.get("trainer_id"))
    if not trainer_id:
        return jsonify({"message": "trainer_id es requerido"}), 400
    trainer = db.session.execute(
        db.select(Trainers).where(Trainers.id == trainer_id)
    ).scalar_one_or_none()
    if not trainer:
        return jsonify({"message": "El ID del entrenador no es válido o no existe como trainer"}), 400
    date = data.get("date")
    time = data.get("time")
    notes = data.get("notes", "")
    court_id = data.get("court_id")
    students_ids = data.get("students", [])
    if not trainer_id or not date or not time or not court_id:
        return jsonify({"message": "trainer_id, date, time and court_id are required"}), 400

    # Validar conflictos
    conflicting_students, court_conflict = check_conflicts(None, date, time, court_id, students_ids)
    if conflicting_students:
        return jsonify({"message": f"Conflicto: Los siguientes alumnos ya tienen una sesión a esta fecha y hora: {', '.join(conflicting_students)}"}), 409
    if court_conflict:
        return jsonify({"message": "Conflicto: La pista ya está ocupada en esta fecha y hora."}), 409

    new_session = Sessions(
        trainer_id=trainer.id,
        date=date,
        time=time,
        notes=notes,
        court_id=court_id
    )
    db.session.add(new_session)
    db.session.commit()

    if students_ids:
        if isinstance(students_ids, str):
            students_ids = [int(students_ids)]
        elif isinstance(students_ids, list):
            students_ids = [int(sid) for sid in students_ids]
        for student_id in students_ids:
            db.session.add(SessionsStudents(session_id=new_session.id, student_id=student_id))
        db.session.commit()

    return jsonify({"message": "Session created successfully", "results": new_session.serialize()}), 201

@session_routes.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_session(id):
    session_obj = db.session.get(Sessions, id)
    if not session_obj:
        return jsonify({"message": "Session not found"}), 404
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")
    if role != "admin" and session_obj.trainer_id != user_id:
        is_assigned = db.session.execute(
            db.select(SessionsStudents).where(
                SessionsStudents.session_id == id,
                SessionsStudents.student_id.in_(
                    db.select(Students.id).where(Students.user_id == user_id)
                )
            )
        ).first()
        if not is_assigned:
            return jsonify({"message": "No autorizado para ver esta sesión"}), 403
    data = session_obj.serialize()
    if isinstance(session_obj.time, str):
        data['time'] = session_obj.time
    elif session_obj.time:
        data['time'] = session_obj.time.strftime("%H:%M")
    else:
        data['time'] = None
    trainer_obj = db.session.get(Trainers, session_obj.trainer_id)
    trainer = db.session.get(Users, trainer_obj.user_id) if trainer_obj else None
    court = db.session.get(Courts, session_obj.court_id)
    data['trainer'] = trainer.serialize() if trainer else None
    data['court'] = court.serialize() if court else None
    associations = db.session.execute(
        db.select(SessionsStudents).where(SessionsStudents.session_id == id)
    ).scalars()
    students_list = []
    for assoc in associations:
        student = db.session.get(Students, assoc.student_id)
        if student:
            user = db.session.get(Users, student.user_id)
            student_data = student.serialize()
            student_data['user'] = user.serialize() if user else None
            student_data.pop('user_id', None)
            student_data.pop('is_active', None)
            students_list.append(student_data)
    data['students'] = students_list
    return jsonify({"message": f"Session {id} found", "results": data}), 200

@session_routes.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_session(id):
    session_obj = db.session.get(Sessions, id)
    if not session_obj:
        return jsonify({"message": "Session not found"}), 404
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")
    if role != "admin" and session_obj.trainer_id != user_id:
        return jsonify({"message": "No autorizado para modificar esta sesión"}), 403
    data = request.json

    date = data.get("date", session_obj.date)
    time = data.get("time", session_obj.time)
    court_id = data.get("court_id", session_obj.court_id)
    students_ids = data.get("students", [])
    if not isinstance(students_ids, list):
        students_ids = [students_ids]

    # Validar conflictos
    conflicting_students, court_conflict = check_conflicts(id, date, time, court_id, students_ids)
    if conflicting_students:
        return jsonify({"message": f"Conflicto: Los siguientes alumnos ya tienen una sesión a esta fecha y hora: {', '.join(conflicting_students)}"}), 409
    if court_conflict:
        return jsonify({"message": "Conflicto: La pista ya está ocupada en esta fecha y hora."}), 409

    session_obj.trainer_id = data.get("trainer_id", session_obj.trainer_id)
    session_obj.date = date
    session_obj.time = time
    session_obj.notes = data.get("notes", session_obj.notes)
    session_obj.court_id = court_id

    current_assocs = db.session.execute(
        db.select(SessionsStudents).where(SessionsStudents.session_id == id)
    ).scalars().all()

    current_student_ids = {assoc.student_id for assoc in current_assocs}
    new_student_ids_set = set(map(int, students_ids))

    for assoc in current_assocs:
        if assoc.student_id not in new_student_ids_set:
            db.session.delete(assoc)

    for student_id in new_student_ids_set:
        if student_id not in current_student_ids:
            db.session.add(SessionsStudents(session_id=id, student_id=student_id))

    db.session.commit()

    return jsonify({"message": f"Session {id} updated successfully", "results": session_obj.serialize()}), 200

@session_routes.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_session(id):
    session_obj = db.session.get(Sessions, id)
    if not session_obj:
        return jsonify({"message": "Session not found"}), 404
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")
    if role != "admin":
        return jsonify({"message": "Solo los administradores pueden eliminar sesiones"}), 403
    db.session.delete(session_obj)
    db.session.commit()
    return jsonify({"message": f"Session {id} deleted successfully"}), 200

@session_routes.route('/monthly', methods=['GET'])
@jwt_required()
def sessions_by_month():
    current_year = datetime.now().year

    result = (
        db.session.query(
            extract('month', Sessions.date).label('month'),
            func.count(Sessions.id).label('count')
        )
        .filter(extract('year', Sessions.date) == current_year)
        .group_by('month')
        .order_by('month')
        .all()
    )

    month_names = {
        1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
        7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'
    }

    response = [
        {'month': month_names[int(month)], 'count': count}
        for month, count in result
    ]

    return jsonify({"message": "Sesiones por mes", "results": response}), 200


# Endpoint para listar sesiones por usuario (trainer o student)
@session_routes.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def sessions_by_user(user_id):
    claims = get_jwt()
    token_user_id = claims.get("user_id")
    role = claims.get("role")

    if role == "admin":
        target_user_id = user_id
    elif token_user_id != user_id:
        return jsonify({"message": "No autorizado para ver las sesiones de otro usuario"}), 403
    else:
        target_user_id = user_id

    sessions = []
    session_ids = []  # Inicializamos para evitar error UnboundLocalError

    print(f"[DEBUG] sessions_by_user called with user_id={user_id}")
    print(f"[DEBUG] role={role}")
    print(f"[DEBUG] token_user_id={token_user_id}")

    if role == "trainer":
        trainer = db.session.execute(
            db.select(Trainers).where(Trainers.user_id == target_user_id)
        ).scalar_one_or_none()
        print(f"[DEBUG] trainer found: {trainer}")
        if not trainer:
            return jsonify({"message": "Entrenador no encontrado"}), 404
        sessions = db.session.execute(
            db.select(Sessions).where(Sessions.trainer_id == trainer.id)
        ).scalars()
        session_ids = [s.id for s in sessions]
        print(f"[DEBUG] sessions found for trainer: {session_ids}")
    elif role == "student":
        student = db.session.execute(
            db.select(Students).where(Students.user_id == target_user_id)
        ).scalar_one_or_none()
        print(f"[DEBUG] student found: {student}")
        if not student:
            return jsonify({"message": "Alumno no encontrado"}), 404

        associations = db.session.execute(
            db.select(SessionsStudents).where(SessionsStudents.student_id == student.id)
        ).scalars()
        sessions = [db.session.get(Sessions, assoc.session_id) for assoc in associations]
        session_ids = [s.id for s in sessions if s is not None]
        print(f"[DEBUG] sessions found for student: {session_ids}")

    result = []
    for session in sessions:
        data = {
            "id": session.id,
            "date": session.date.strftime("%d/%m/%Y") if session.date else None,
            "time": session.time if isinstance(session.time, str) else session.time.strftime("%H:%M") if session.time else None,
            "notes": session.notes,
            "court": db.session.get(Courts, session.court_id).serialize() if session.court_id else None,
            "trainer": db.session.get(Users, session.trainer_id).serialize() if session.trainer_id else None
        }
        associations = db.session.execute(
            db.select(SessionsStudents).where(SessionsStudents.session_id == session.id)
        ).scalars()
        students_list = []
        for assoc in associations:
            student = db.session.get(Students, assoc.student_id)
            if student:
                user = db.session.get(Users, student.user_id)
                student_data = student.serialize()
                student_data['user'] = user.serialize() if user else None
                student_data.pop('user_id', None)
                student_data.pop('is_active', None)
                students_list.append(student_data)
        data['students'] = students_list
        result.append(data)

    print(f"[DEBUG] returning {len(session_ids)} sessions")
    return jsonify({"message": "Sesiones del usuario", "results": result}), 200

@session_routes.route('/trainer/<int:trainer_id>', methods=['GET'])
@jwt_required()
def sessions_by_trainer(trainer_id):
    claims = get_jwt()
    role = claims.get("role")
    
    # Solo admin o el propio entrenador pueden ver las sesiones
    trainer = db.session.execute(db.select(Trainers).where(Trainers.id == trainer_id)).scalar_one_or_none()
    if not trainer:
        return jsonify({"message": "Entrenador no encontrado"}), 404
    
    if role != "admin" and role != "trainer":
        return jsonify({"message": "No autorizado"}), 403
    
    if role == "trainer":
        user_id = claims.get("user_id")
        if trainer.user_id != user_id:
            return jsonify({"message": "No autorizado para ver las sesiones de este entrenador"}), 403
    
    sessions = db.session.execute(
        db.select(Sessions).where(Sessions.trainer_id == trainer_id)
    ).scalars()
    
    result = []
    for session in sessions:
        data = {
            "id": session.id,
            "date": session.date.strftime("%d/%m/%Y") if session.date else None,
            "time": session.time if isinstance(session.time, str) else session.time.strftime("%H:%M") if session.time else None,
            "notes": session.notes,
            "court": db.session.get(Courts, session.court_id).serialize() if session.court_id else None,
            "trainer": db.session.get(Users, session.trainer_id).serialize() if session.trainer_id else None
        }
        associations = db.session.execute(
            db.select(SessionsStudents).where(SessionsStudents.session_id == session.id)
        ).scalars()
        students_list = []
        for assoc in associations:
            student = db.session.get(Students, assoc.student_id)
            if student:
                user = db.session.get(Users, student.user_id)
                student_data = student.serialize()
                student_data['user'] = user.serialize() if user else None
                student_data.pop('user_id', None)
                student_data.pop('is_active', None)
                students_list.append(student_data)
        data['students'] = students_list
        result.append(data)
    
    return jsonify({"message": f"Sesiones del entrenador {trainer_id}", "results": result}), 200