from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity, create_access_token
from .models import Users, Students, Trainers, Courts, Sessions, SessionsStudents
from . import db

api = Blueprint('api', __name__)

# Endpoints de autenticación y protección

@api.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if not user or not user.check_password(password):
        return jsonify({"message": "User or password incorrect"}), 401
    if not user.is_active:
        return jsonify({"message": "User is inactive, please contact support"}), 403
    access_token = create_access_token(identity=email, additional_claims={"user_id": user.id, "role": user.role})
    return jsonify({
        "access_token": access_token,
        "message": "User logged",
        "results": user.serialize()
    }), 200

@api.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    claims = get_jwt()
    return jsonify({
        "message": f"Logged as {current_user}",
        "user_id": claims.get("user_id"),
        "role": claims.get("role")
    }), 200

@api.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", "")
    last_name = data.get("last_name", "")
    phone = data.get("phone", "")
    if not email or not password:
        return jsonify({"message": "Email y password son requeridos"}), 400
    # Verificar si el usuario ya existe
    existing_user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if existing_user:
        return jsonify({"message": "El usuario ya existe"}), 409
    # Crear un nuevo usuario con rol "user" (o el rol que prefieras)
    new_user = Users(
        email=email,
        name=name,
        last_name=last_name,
        phone=phone,
        role=data.get("role", "student"),
        is_active=True
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Usuario creado exitosamente", "results": new_user.serialize()}), 201

@api.route("/users-admin", methods=["POST"])
@jwt_required(optional=True)
def create_admin():
    # Verificar si ya existe algún admin
    existing_admin = db.session.execute(db.select(Users).where(Users.role == "admin")).scalar()
    if existing_admin:
        # Si ya hay un admin, se requiere autenticación y rol admin
        claims = get_jwt()
        role_from_token = claims.get("role")
        if role_from_token != "admin":
            return jsonify({"message": "No autorizado. Solo un admin puede crear otro admin."}), 403
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", "")
    last_name = data.get("last_name", "")
    phone = data.get("phone", "")
    if not email or not password:
        return jsonify({"message": "Email y password son requeridos"}), 400
    # Verificar si el usuario ya existe
    existing_user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if existing_user:
        return jsonify({"message": "El usuario ya existe"}), 409
    new_admin = Users(
        email=email,
        name=name,
        last_name=last_name,
        phone=phone,
        role="admin",  # Asignar rol admin
        is_active=True
    )
    new_admin.set_password(password)
    db.session.add(new_admin)
    db.session.commit()
    return jsonify({"message": "Usuario ADMIN creado exitosamente"}), 201

# Endpoints para Users
@api.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    claims = get_jwt()
    # Sólo un admin puede listar todos los usuarios
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    users = db.session.execute(db.select(Users)).scalars()
    result = [user.serialize() for user in users]
    return jsonify({"message": "Lista de usuarios", "results": result}), 200

@api.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
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
        role=data.get("role", "student"),
        is_active=True
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Usuario creado exitosamente", "results": new_user.serialize()}), 201

@api.route('/users/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_user(id):
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    user = db.session.get(Users, id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # GET: admin puede ver cualquier usuario; otros sólo su propio perfil
    if request.method == 'GET':
        if claims.get("role") != "admin" and user.id != current_user_id:
            return jsonify({"message": "Unauthorized access"}), 403
        return jsonify({"message": f"User {id} found", "results": user.serialize()}), 200

    # PUT y DELETE: solo admin puede modificar o desactivar usuarios
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403

    if request.method == 'PUT':
        data = request.json
        user.name = data.get("name", user.name)
        user.last_name = data.get("last_name", user.last_name)
        user.phone = data.get("phone", user.phone)
        if "is_active" in data and user.id != current_user_id:
            user.is_active = data["is_active"]
        db.session.commit()
        return jsonify({"message": f"User {id} updated successfully", "results": user.serialize()}), 200

    if request.method == 'DELETE':
        if user.id == current_user_id:
            return jsonify({"message": "No puedes desactivarte a ti mismo"}), 403
        user.is_active = False
        db.session.commit()
        return jsonify({"message": f"User {id} deactivated successfully"}), 200

# Endpoints para Students
@api.route('/students', methods=['GET'])
@jwt_required()
def list_students():
    students = db.session.execute(db.select(Students)).scalars()
    result = [student.serialize() for student in students]
    return jsonify({"message": "Lista de estudiantes", "results": result}), 200

@api.route('/students', methods=['POST'])
@jwt_required()
def create_student():
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

@api.route('/students/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_student(id):
    student = db.session.get(Students, id)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    if request.method == 'GET':
        return jsonify({"message": f"Student {id} found", "results": student.serialize()}), 200
    elif request.method == 'PUT':
        data = request.json
        student.level = data.get("level", student.level)
        student.age = data.get("age", student.age)
        if "is_active" in data:
            student.is_active = data["is_active"]
        db.session.commit()
        return jsonify({"message": f"Student {id} updated successfully", "results": student.serialize()}), 200
    elif request.method == 'DELETE':
        student.is_active = False
        db.session.commit()
        return jsonify({"message": f"Student {id} deactivated successfully"}), 200

# Endpoints para Trainers
@api.route('/trainers', methods=['GET'])
@jwt_required()
def list_trainers():
    trainers = db.session.execute(db.select(Trainers)).scalars()
    result = [trainer.serialize() for trainer in trainers]
    return jsonify({"message": "Lista de entrenadores", "results": result}), 200

@api.route('/trainers', methods=['POST'])
@jwt_required()
def create_trainer():
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"message": "user_id is required"}), 400
    new_trainer = Trainers(user_id=user_id)
    db.session.add(new_trainer)
    db.session.commit()
    return jsonify({"message": "Trainer created successfully", "results": new_trainer.serialize()}), 201

@api.route('/trainers/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_trainer(id):
    trainer = db.session.get(Trainers, id)
    if not trainer:
        return jsonify({"message": "Trainer not found"}), 404
    if request.method == 'GET':
        return jsonify({"message": f"Trainer {id} found", "results": trainer.serialize()}), 200
    elif request.method == 'PUT':
        data = request.json
        if "is_active" in data:
            trainer.is_active = data["is_active"]
        db.session.commit()
        return jsonify({"message": f"Trainer {id} updated successfully", "results": trainer.serialize()}), 200
    elif request.method == 'DELETE':
        trainer.is_active = False
        db.session.commit()
        return jsonify({"message": f"Trainer {id} deactivated successfully"}), 200

# Endpoints para Courts
@api.route('/courts', methods=['GET'])
def list_courts():
    courts = db.session.execute(db.select(Courts)).scalars()
    result = [court.serialize() for court in courts]
    return jsonify({"message": "Lista de canchas", "results": result}), 200

@api.route('/courts', methods=['POST'])
@jwt_required()
def create_court():
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

@api.route('/courts/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_court(id):
    court = db.session.get(Courts, id)
    if not court:
        return jsonify({"message": "Court not found"}), 404
    if request.method == 'GET':
        return jsonify({"message": f"Court {id} found", "results": court.serialize()}), 200
    elif request.method == 'PUT':
        data = request.json
        court.name = data.get("name", court.name)
        court.type = data.get("court_type", court.court_type)
        court.location = data.get("location", court.location)
        db.session.commit()
        return jsonify({"message": f"Court {id} updated successfully", "results": court.serialize()}), 200
    elif request.method == 'DELETE':
        db.session.delete(court)
        db.session.commit()
        return jsonify({"message": f"Court {id} deleted successfully"}), 200

# Endpoints para Sessions
@api.route('/sessions', methods=['GET'])
@jwt_required()
def list_sessions():
    sessions = db.session.execute(db.select(Sessions)).scalars()
    result = [session.serialize() for session in sessions]
    return jsonify({"message": "Lista de sesiones", "results": result}), 200

@api.route('/sessions', methods=['POST'])
@jwt_required()
def create_session():
    data = request.json
    trainer_id = data.get("trainer_id")
    date = data.get("date")
    time = data.get("time")
    notes = data.get("notes", "")
    court_id = data.get("court_id")
    if not trainer_id or not date or not time or not court_id:
        return jsonify({"message": "trainer_id, date, time and court_id are required"}), 400
    new_session = Sessions(trainer_id=trainer_id, date=date, time=time, notes=notes, court_id=court_id)
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"message": "Session created successfully", "results": new_session.serialize()}), 201

@api.route('/sessions/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_session(id):
    session_obj = db.session.get(Sessions, id)
    if not session_obj:
        return jsonify({"message": "Session not found"}), 404
    if request.method == 'GET':
        return jsonify({"message": f"Session {id} found", "results": session_obj.serialize()}), 200
    elif request.method == 'PUT':
        data = request.json
        session_obj.trainer_id = data.get("trainer_id", session_obj.trainer_id)
        session_obj.date = data.get("date", session_obj.date)
        session_obj.time = data.get("time", session_obj.time)
        session_obj.notes = data.get("notes", session_obj.notes)
        session_obj.court_id = data.get("court_id", session_obj.court_id)
        db.session.commit()
        return jsonify({"message": f"Session {id} updated successfully", "results": session_obj.serialize()}), 200
    elif request.method == 'DELETE':
        db.session.delete(session_obj)
        db.session.commit()
        return jsonify({"message": f"Session {id} deleted successfully"}), 200

# Endpoints para SessionsStudents
@api.route('/session-students', methods=['GET'])
@jwt_required()
def list_session_students():
    ss_records = db.session.execute(db.select(SessionsStudents)).scalars()
    result = [ss.serialize() for ss in ss_records]
    return jsonify({"message": "Lista de sesiones-estudiantes", "results": result}), 200

@api.route('/session-students', methods=['POST'])
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

@api.route('/session-students/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_session_student(id):
    ss = db.session.get(SessionsStudents, id)
    if not ss:
        return jsonify({"message": "SessionStudent not found"}), 404
    if request.method == 'GET':
        return jsonify({"message": f"SessionStudent {id} found", "results": ss.serialize()}), 200
    elif request.method == 'PUT':
        data = request.json
        ss.session_id = data.get("session_id", ss.session_id)
        ss.student_id = data.get("student_id", ss.student_id)
        db.session.commit()
        return jsonify({"message": f"SessionStudent {id} updated successfully", "results": ss.serialize()}), 200
    elif request.method == 'DELETE':
        db.session.delete(ss)
        db.session.commit()
        return jsonify({"message": f"SessionStudent {id} deleted successfully"}), 200