from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity, create_access_token
import uuid
import datetime
from flask import current_app
from .models import Users, Students, Trainers, Courts, Sessions, SessionsStudents, Invitations
from . import db
from .invitation_utils import create_invitation, send_invitation_email

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
    import datetime
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", "")
    last_name = data.get("last_name", "")
    phone = data.get("phone", "")
    token = data.get("token")
    if not email or not password:
        return jsonify({"message": "Email y password son requeridos"}), 400
    # Validación de invitación y token
    if token:
        invitation = db.session.execute(
            db.select(Invitations).where(Invitations.email == email, Invitations.token == token)
        ).scalar()
        if not invitation:
            return jsonify({"message": "Invitación no válida o token incorrecto"}), 400
        # Verificar que no haya expirado (48h)
        if (datetime.datetime.utcnow() - invitation.created_at).total_seconds() > 172800:
            return jsonify({"message": "El enlace de invitación ha expirado"}), 400
    else:
        return jsonify({"message": "Token de invitación requerido"}), 400
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
    # Marcar el token como usado (eliminar la invitación)
    if token:
        db.session.delete(invitation)
        db.session.commit()
    return jsonify({"message": "Usuario creado exitosamente", "results": new_user.serialize()}), 201

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
        print(f"[DEBUG] Cuerpo del PUT: {data}")
        user.name = data.get("name", user.name)
        user.last_name = data.get("last_name", user.last_name)
        user.phone = data.get("phone", user.phone)
        if "is_active" in data and user.id != current_user_id:
            user.is_active = data["is_active"]
        if "role" in data:
            print(f"[DEBUG] Rol recibido en PUT: {data['role']}")
            if claims.get("role") == "admin":
                allowed_roles = {"admin", "trainer", "student"}
                if data["role"] not in allowed_roles:
                    return jsonify({"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}), 400
                user.role = data["role"]
                print(f"[DEBUG] Rol actualizado a: {user.role}")
            else:
                return jsonify({"message": "Solo un admin puede cambiar el rol del usuario"}), 403
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
        court.court_type = data.get("court_type", court.court_type)
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


@api.route('/invitations', methods=['POST'])
@jwt_required()
def send_invitations():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403

    import pandas as pd
    file = request.files.get("file")
    if not file:
        return jsonify({"message": "Debe subir un archivo Excel con una columna 'email'"}), 400

    try:
        df = pd.read_excel(file, sheet_name=0)

        print("[DEBUG] Columnas del archivo:", df.columns)

        if 'email' not in df.columns:
            return jsonify({"message": "El archivo debe contener una columna llamada 'email'"}), 400

        emails = df['email'].dropna().tolist()

        if not emails:
            return jsonify({"message": "No se encontraron correos electrónicos válidos en el archivo"}), 400

    except Exception as e:
        return jsonify({"message": f"Error al procesar el archivo: {str(e)}"}), 400

    if not emails or not isinstance(emails, list):
        return jsonify({"message": "Debe proporcionar una lista de correos electrónicos"}), 400

    invitations_sent = []
    import traceback
    for email in emails:
        # Verificar si ya existe una invitación válida
        existing_invitation = db.session.execute(
            db.select(Invitations).where(Invitations.email == email)
        ).scalar()
        if existing_invitation:
            time_diff = (datetime.datetime.utcnow() - existing_invitation.created_at).total_seconds()
            if time_diff <= 172800:
                invitations_sent.append({
                    "email": email,
                    "message": "Ya existe una invitación válida"
                })
                continue
        try:
            token = create_invitation(email, role="student")
            if not token or not isinstance(token, str):
                raise ValueError(f"No se generó un token válido para {email}")
            link = f"https://padelcoach.com/register?token={token}&email={email}"
            # Enviar correo con try/except para registrar el estado del envío
            try:
                send_invitation_email(email, link)
                print(f"[EMAIL ENVIADO] Invitación enviada a {email}")
            except Exception as e:
                print(f"[ERROR DE EMAIL] No se pudo enviar el correo a {email}: {str(e)}")
                invitations_sent.append({
                    "email": email,
                    "error": f"Fallo al enviar correo: {str(e)}"
                })
                continue
            if not isinstance(email, str):
                raise ValueError(f"El valor de email no es una cadena: {email}")
            print(f"[DEBUG] Procesando invitación para {email} con link {link}")
            invitations_sent.append({
                "email": email,
                "link": link,
                "message": "Invitación enviada correctamente"
            })
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"[ERROR] Fallo al procesar la invitación para {email}: {error_trace}")
            invitations_sent.append({
                "email": email,
                "error": f"{str(e)}"
            })

    return jsonify({
        "message": "Invitaciones procesadas",
        "results": invitations_sent
    }), 200


# Endpoint para listar invitaciones
@api.route('/invitations', methods=['GET'])
@jwt_required()
def list_invitations():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403

    invitations = db.session.execute(db.select(Invitations)).scalars()
    results = [{
        "id": inv.id,
        "email": inv.email,
        "token": inv.token,
        "created_at": inv.created_at,
        "expires_at": inv.created_at + datetime.timedelta(hours=48)
    } for inv in invitations]

    return jsonify({
        "message": "Lista de invitaciones",
        "results": results
    }), 200


# Endpoint para reenviar invitaciones expiradas
@api.route('/invitations/resend', methods=['POST'])
@jwt_required()
def resend_invitation():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403

    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email es requerido"}), 400

    invitation = db.session.execute(
        db.select(Invitations).where(Invitations.email == email)
    ).scalar()

    if not invitation:
        return jsonify({"message": "No se encontró invitación para este email"}), 404

    # Check if expired
    if (datetime.datetime.utcnow() - invitation.created_at).total_seconds() <= 172800:
        return jsonify({"message": "La invitación aún es válida"}), 400

    # Delete old and create a new one
    db.session.delete(invitation)
    db.session.commit()

    new_token = create_invitation(email)
    link = f"https://padelcoach.com/register?token={new_token}&email={email}"
    send_invitation_email(email, link)

    return jsonify({
        "message": "Invitación reenviada",
        "email": email,
        "link": link
    }), 200