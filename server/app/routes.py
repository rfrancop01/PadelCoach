from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity, create_access_token
import datetime
from flask_restx import Namespace, Resource, fields
# --- Swagger UI Security Definition for Bearer Auth ---
from flask_restx import Api
from .models import Users, Students, Trainers, Courts, Sessions, SessionsStudents, Invitations, PasswordResetToken
from .models import TrainingPlan
from . import db
from .invitation_utils import create_invitation, send_invitation_email

# Namespaces for RESTX
auth_ns = Namespace('auth', description='Authentication endpoints')
users_ns = Namespace('users', description='User management endpoints')

# Models for Swagger docs
login_model = auth_ns.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

signup_model = auth_ns.model('Signup', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password'),
    'name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'phone': fields.String(description='Phone'),
    'token': fields.String(description='Invitation token')
})

user_model = users_ns.model('User', {
    'id': fields.Integer(description='User ID'),
    'email': fields.String(description='Email'),
    'name': fields.String(description='Name'),
    'last_name': fields.String(description='Last name'),
    'phone': fields.String(description='Phone'),
    'role': fields.String(description='Role'),
    'is_active': fields.Boolean(description='Active')
})

# --- AUTH ENDPOINTS ---

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.doc(description="Login with email and password")
    def post(self):
        data = request.json
        email = data.get("email")
        password = data.get("password")
        user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
        if not user or not user.check_password(password):
            return {"message": "User or password incorrect"}, 401
        if not user.is_active:
            return {"message": "User is inactive, please contact support"}, 403
        access_token = create_access_token(identity=email, additional_claims={"user_id": user.id, "role": user.role})
        return {
            "access_token": access_token,
            "message": "User logged",
            "results": user.serialize()
        }, 200

@auth_ns.route('/protected')
class Protected(Resource):
    @auth_ns.doc(security="Bearer", description="Protected endpoint")
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        claims = get_jwt()
        return {
            "message": f"Logged as {current_user}",
            "user_id": claims.get("user_id"),
            "role": claims.get("role")
        }, 200


@auth_ns.route('/signup')
class Signup(Resource):
    @auth_ns.expect(signup_model)
    @auth_ns.doc(description="Register a new user using invitation token")
    def post(self):
        data = request.json
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "")
        last_name = data.get("last_name", "")
        phone = data.get("phone", "")
        token = data.get("token")
        role = data.get("role", "student")
        allowed_roles = {"admin", "trainer", "student"}
        if role not in allowed_roles:
            return {"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}, 400
        if not email or not password:
            return {"message": "Email y password son requeridos"}, 400
        if token:
            invitation = db.session.execute(
                db.select(Invitations).where(Invitations.email == email, Invitations.token == token)
            ).scalar()
            if not invitation:
                return {"message": "Invitación no válida o token incorrecto"}, 400
            if (datetime.datetime.utcnow() - invitation.created_at).total_seconds() > 172800:
                return {"message": "El enlace de invitación ha expirado"}, 400
        else:
            return {"message": "Token de invitación requerido"}, 400
        existing_user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
        if existing_user:
            return {"message": "El usuario ya existe"}, 409
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
        if token:
            db.session.delete(invitation)
            db.session.commit()
        return {"message": "Usuario creado exitosamente", "results": new_user.serialize()}, 201


import secrets

reset_request_model = auth_ns.model('PasswordResetRequest', {
    'email': fields.String(required=True, description='Registered email address')
})

reset_password_model = auth_ns.model('ResetPassword', {
    'token': fields.String(required=True, description='Reset token'),
    'new_password': fields.String(required=True, description='New password')
})

@auth_ns.route('/request-password-reset')
class RequestPasswordReset(Resource):
    @auth_ns.expect(reset_request_model)
    def post(self):
        data = request.json
        email = data.get('email')
        user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
        if not user:
            return {"message": "No se encontró usuario con ese email"}, 404

        token = secrets.token_urlsafe(32)
        prt = PasswordResetToken(user_id=user.id, token=token)
        db.session.add(prt)
        db.session.commit()

        reset_link = f"https://padelcoach.com/reset-password?token={token}"
        try:
            send_invitation_email(
                email,
                f"Hola {user.name},\n\n"
                f"Haz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_link}\n\n"
                "Si no solicitaste este cambio, ignora este mensaje."
            )
        except Exception as e:
            return {"message": f"Error al enviar el correo: {str(e)}"}, 500

        return {"message": "Correo de restablecimiento enviado"}, 200

@auth_ns.route('/reset-password')
class ResetPassword(Resource):
    @auth_ns.expect(reset_password_model)
    def post(self):
        data = request.json
        token = data.get("token")
        new_password = data.get("new_password")

        record = db.session.execute(
            db.select(PasswordResetToken).where(PasswordResetToken.token == token)
        ).scalar()

        if not record:
            return {"message": "Token inválido"}, 400

        if record.used:
            return {"message": "El token ya ha sido utilizado"}, 400

        if (datetime.datetime.utcnow() - record.created_at).total_seconds() > 1800:
            return {"message": "El token ha expirado"}, 400

        user = db.session.get(Users, record.user_id)
        if not user:
            return {"message": "Usuario no encontrado"}, 404

        user.set_password(new_password)
        record.used = True
        db.session.commit()

        return {"message": "Contraseña actualizada correctamente"}, 200

# --- USERS ENDPOINTS ---

@users_ns.route('/')
class UserList(Resource):
    @users_ns.doc(security="Bearer", description="List all users (admin only)")
    @jwt_required()
    @users_ns.marshal_list_with(user_model)
    def get(self):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        users = db.session.execute(db.select(Users)).scalars()
        return {
            "message": "Lista de usuarios",
            "results": [user.serialize() for user in users]
        }, 200

    @users_ns.doc(security="Bearer", description="Create a user (admin only)")
    @jwt_required()
    @users_ns.expect(user_model)
    def post(self):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        data = request.json
        role = data.get("role", "student")
        allowed_roles = {"admin", "trainer", "student"}
        if role not in allowed_roles:
            return {"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}, 400
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "")
        last_name = data.get("last_name", "")
        phone = data.get("phone", "")
        if not email or not password:
            return {"message": "Email y password son requeridos"}, 400
        existing = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
        if existing:
            return {"message": "El usuario ya existe"}, 409
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
        return {"message": "Usuario creado exitosamente", "results": new_user.serialize()}, 201

@users_ns.route('/<int:id>')
class UserDetail(Resource):
    @users_ns.doc(security="Bearer", description="Get user details")
    @jwt_required()
    def get(self, id):
        claims = get_jwt()
        current_user_id = claims.get("user_id")
        user = db.session.get(Users, id)
        if not user:
            return {"message": "User not found"}, 404
        if claims.get("role") != "admin" and user.id != current_user_id:
            return {"message": "Unauthorized access"}, 403
        return {"message": f"User {id} found", "results": user.serialize()}, 200

    @users_ns.doc(security="Bearer", description="Update user (admin only)")
    @jwt_required()
    def put(self, id):
        claims = get_jwt()
        current_user_id = claims.get("user_id")
        user = db.session.get(Users, id)
        if not user:
            return {"message": "User not found"}, 404
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        data = request.json
        user.name = data.get("name", user.name)
        user.last_name = data.get("last_name", user.last_name)
        user.phone = data.get("phone", user.phone)
        if "is_active" in data and user.id != current_user_id:
            user.is_active = data["is_active"]
        if "role" in data:
            allowed_roles = {"admin", "trainer", "student"}
            if data["role"] not in allowed_roles:
                return {"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}, 400
            user.role = data["role"]
        db.session.commit()
        return {"message": f"User {id} updated successfully", "results": user.serialize()}, 200

    @users_ns.doc(security="Bearer", description="Deactivate user (admin only)")
    @jwt_required()
    def delete(self, id):
        claims = get_jwt()
        current_user_id = claims.get("user_id")
        user = db.session.get(Users, id)
        if not user:
            return {"message": "User not found"}, 404
        if user.id == current_user_id:
            return {"message": "No puedes desactivarte a ti mismo"}, 403
        user.is_active = False
        db.session.commit()
        return {"message": f"User {id} deactivated successfully"}, 200


# Students Namespace and Models
students_ns = Namespace('students', description='Student endpoints')

student_model = students_ns.model('Student', {
    'id': fields.Integer(description='Student ID'),
    'level': fields.String(description='Level'),
    'age': fields.Integer(description='Age'),
    'user_id': fields.Integer(description='User ID'),
    'is_active': fields.Boolean(description='Active'),
    'user': fields.Nested(user_model, description='Associated user')
})

student_input_model = students_ns.model('StudentInput', {
    'level': fields.String(required=True, description='Level'),
    'age': fields.Integer(required=True, description='Age'),
    'user_id': fields.Integer(required=True, description='User ID')
})

# Endpoint para listar y crear estudiantes
@students_ns.route('/')
class StudentList(Resource):
    @students_ns.doc(security="Bearer")
    @jwt_required()
    @students_ns.marshal_list_with(student_model)
    def get(self):
        students = db.session.execute(db.select(Students)).scalars()
        result = []
        for student in students:
            data = student.serialize()
            data.pop('user_id', None)
            data.pop('is_active', None)
            # include nested user information
            user = db.session.get(Users, student.user_id)
            data['user'] = user.serialize() if user else None
            result.append(data)
        return {
            "message": "Lista de estudiantes",
            "results": result
        }, 200

    @students_ns.doc(security="Bearer")
    @jwt_required()
    @students_ns.expect(student_input_model)
    @students_ns.marshal_with(student_model, code=201)
    def post(self):
        data = request.json
        level = data.get("level")
        age = data.get("age")
        user_id = data.get("user_id")
        if not level or not age or not user_id:
            students_ns.abort(400, "level, age and user_id are required")
        new_student = Students(level=level, age=age, user_id=user_id)
        db.session.add(new_student)
        db.session.commit()
        return new_student.serialize(), 201

# Endpoint para obtener, actualizar o eliminar un estudiante
@students_ns.route('/<int:id>')
class StudentDetail(Resource):
    @students_ns.doc(security="Bearer")
    @jwt_required()
    @students_ns.marshal_with(student_model)
    def get(self, id):
        student = db.session.get(Students, id)
        if not student:
            students_ns.abort(404, "Student not found")
        data = student.serialize()
        data.pop('user_id', None)
        data.pop('is_active', None)
        return {
            "message": f"Student {id} found",
            "results": data
        }, 200

    @students_ns.doc(security="Bearer")
    @jwt_required()
    @students_ns.expect(student_input_model)
    @students_ns.marshal_with(student_model)
    def put(self, id):
        student = db.session.get(Students, id)
        if not student:
            students_ns.abort(404, "Student not found")
        data = request.json
        student.level = data.get("level", student.level)
        student.age = data.get("age", student.age)
        if "is_active" in data:
            student.is_active = data["is_active"]
        db.session.commit()
        return student.serialize(), 200

    @students_ns.doc(security="Bearer")
    @jwt_required()
    def delete(self, id):
        student = db.session.get(Students, id)
        if not student:
            students_ns.abort(404, "Student not found")
        student.is_active = False
        db.session.commit()
        return {"message": f"Student {id} deactivated successfully"}, 200

trainers_ns = Namespace('trainers', description='Trainer endpoints')

@trainers_ns.route('/')
class TrainerList(Resource):
    @trainers_ns.doc(security="Bearer")
    @jwt_required()
    def get(self):
        trainers = db.session.execute(db.select(Trainers)).scalars()
        result = []
        for trainer in trainers:
            data = trainer.serialize()
            # include nested user information
            user = db.session.get(Users, trainer.user_id)
            data['user'] = user.serialize() if user else None
            # remove raw user_id and is_active if present
            data.pop('user_id', None)
            data.pop('is_active', None)
            result.append(data)
        return {"message": "Lista de entrenadores", "results": result}, 200

    @trainers_ns.doc(security="Bearer")
    @jwt_required()
    def post(self):
        data = request.json
        user_id = data.get("user_id")
        if not user_id:
            return {"message": "user_id is required"}, 400
        new_trainer = Trainers(user_id=user_id)
        db.session.add(new_trainer)
        db.session.commit()
        return {"message": "Trainer created successfully", "results": new_trainer.serialize()}, 201

@trainers_ns.route('/<int:id>')
class TrainerDetail(Resource):
    @trainers_ns.doc(security="Bearer")
    @jwt_required()
    def get(self, id):
        trainer = db.session.get(Trainers, id)
        if not trainer:
            return {"message": "Trainer not found"}, 404
        return {"message": f"Trainer {id} found", "results": trainer.serialize()}, 200

    @trainers_ns.doc(security="Bearer")
    @jwt_required()
    def put(self, id):
        trainer = db.session.get(Trainers, id)
        if not trainer:
            return {"message": "Trainer not found"}, 404
        data = request.json
        if "is_active" in data:
            trainer.is_active = data["is_active"]
        db.session.commit()
        return {"message": f"Trainer {id} updated successfully", "results": trainer.serialize()}, 200

    @trainers_ns.doc(security="Bearer")
    @jwt_required()
    def delete(self, id):
        trainer = db.session.get(Trainers, id)
        if not trainer:
            return {"message": "Trainer not found"}, 404
        trainer.is_active = False
        db.session.commit()
        return {"message": f"Trainer {id} deactivated successfully"}, 200


courts_ns = Namespace('courts', description='Court endpoints')

@courts_ns.route('/')
class CourtList(Resource):
    def get(self):
        courts = db.session.execute(db.select(Courts)).scalars()
        result = [court.serialize() for court in courts]
        return {"message": "Lista de canchas", "results": result}, 200

    @jwt_required()
    def post(self):
        data = request.json
        name = data.get("name")
        court_type = data.get("court_type")
        location = data.get("location")
        if not name or not court_type or not location:
            return {"message": "name, court type and location are required"}, 400
        new_court = Courts(name=name, court_type=court_type, location=location)
        db.session.add(new_court)
        db.session.commit()
        return {"message": "Court created successfully", "results": new_court.serialize()}, 201

@courts_ns.route('/<int:id>')
class CourtDetail(Resource):
    @courts_ns.doc(security="Bearer")
    @jwt_required()
    def get(self, id):
        court = db.session.get(Courts, id)
        if not court:
            return {"message": "Court not found"}, 404
        sessions = db.session.execute(db.select(Sessions).where(Sessions.court_id == id)).scalars()
        sessions_data = []
        for s in sessions:
            d = s.serialize()
            d.pop('court_id', None)
            d.pop('notes', None)
            sessions_data.append(d)
        data = court.serialize()
        data['sessions'] = sessions_data
        return {
            "message": f"Court {id} found",
            "results": data
        }, 200

    @courts_ns.doc(security="Bearer")
    @jwt_required()
    def put(self, id):
        court = db.session.get(Courts, id)
        if not court:
            return {"message": "Court not found"}, 404
        data = request.json
        court.name = data.get("name", court.name)
        court.court_type = data.get("court_type", court.court_type)
        court.location = data.get("location", court.location)
        db.session.commit()
        return {"message": f"Court {id} updated successfully", "results": court.serialize()}, 200

    @courts_ns.doc(security="Bearer")
    @jwt_required()
    def delete(self, id):
        court = db.session.get(Courts, id)
        if not court:
            return {"message": "Court not found"}, 404
        db.session.delete(court)
        db.session.commit()
        return {"message": f"Court {id} deleted successfully"}, 200


sessions_ns = Namespace('sessions', description='Session endpoints')

@sessions_ns.route('/')
class SessionList(Resource):
    @sessions_ns.doc(security="Bearer")
    @jwt_required()
    def get(self):
        sessions = db.session.execute(db.select(Sessions)).scalars()
        result = []
        for session in sessions:
            data = session.serialize()
            # nested trainer
            trainer = db.session.get(Users, session.trainer_id)
            data['trainer'] = trainer.serialize() if trainer else None
            # nested court
            court = db.session.get(Courts, session.court_id)
            data['court'] = court.serialize() if court else None
            # nested students
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
        return {"message": "Lista de sesiones", "results": result}, 200

    @sessions_ns.doc(security="Bearer")
    @jwt_required()
    def post(self):
        data = request.json
        trainer_id = data.get("trainer_id")
        date = data.get("date")
        time = data.get("time")
        notes = data.get("notes", "")
        court_id = data.get("court_id")
        if not trainer_id or not date or not time or not court_id:
            return {"message": "trainer_id, date, time and court_id are required"}, 400
        new_session = Sessions(trainer_id=trainer_id, date=date, time=time, notes=notes, court_id=court_id)
        db.session.add(new_session)
        db.session.commit()
        return {"message": "Session created successfully", "results": new_session.serialize()}, 201

@sessions_ns.route('/<int:id>')
class SessionDetail(Resource):
    @sessions_ns.doc(security="Bearer")
    @jwt_required()
    def get(self, id):
        session_obj = db.session.get(Sessions, id)
        if not session_obj:
            return {"message": "Session not found"}, 404
        data = session_obj.serialize()
        trainer = db.session.get(Users, session_obj.trainer_id)
        data['trainer'] = trainer.serialize() if trainer else None
        court = db.session.get(Courts, session_obj.court_id)
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
        return {"message": f"Session {id} found", "results": data}, 200

    @sessions_ns.doc(security="Bearer")
    @jwt_required()
    def put(self, id):
        session_obj = db.session.get(Sessions, id)
        if not session_obj:
            return {"message": "Session not found"}, 404
        data = request.json
        session_obj.trainer_id = data.get("trainer_id", session_obj.trainer_id)
        session_obj.date = data.get("date", session_obj.date)
        session_obj.time = data.get("time", session_obj.time)
        session_obj.notes = data.get("notes", session_obj.notes)
        session_obj.court_id = data.get("court_id", session_obj.court_id)
        db.session.commit()
        return {"message": f"Session {id} updated successfully", "results": session_obj.serialize()}, 200

    @sessions_ns.doc(security="Bearer")
    @jwt_required()
    def delete(self, id):
        session_obj = db.session.get(Sessions, id)
        if not session_obj:
            return {"message": "Session not found"}, 404
        db.session.delete(session_obj)
        db.session.commit()
        return {"message": f"Session {id} deleted successfully"}, 200


ss_ns = Namespace('session_students', description='Session-Student relationship endpoints')

@ss_ns.route('/')
class SessionStudentList(Resource):
    @ss_ns.doc(security="Bearer")
    @jwt_required()
    def get(self):
        ss_records = db.session.execute(db.select(SessionsStudents)).scalars()
        result = [ss.serialize() for ss in ss_records]
        return {"message": "Lista de sesiones-estudiantes", "results": result}, 200

    @ss_ns.doc(security="Bearer")
    @jwt_required()
    def post(self):
        data = request.json
        session_id = data.get("session_id")
        student_id = data.get("student_id")
        if not session_id or not student_id:
            return {"message": "session_id and student_id are required"}, 400
        new_ss = SessionsStudents(session_id=session_id, student_id=student_id)
        db.session.add(new_ss)
        db.session.commit()
        return {"message": "SessionStudent created successfully", "results": new_ss.serialize()}, 201

@ss_ns.route('/<int:id>')
class SessionStudentDetail(Resource):
    @ss_ns.doc(security="Bearer")
    @jwt_required()
    def get(self, id):
        ss = db.session.get(SessionsStudents, id)
        if not ss:
            return {"message": "SessionStudent not found"}, 404
        return {"message": f"SessionStudent {id} found", "results": ss.serialize()}, 200

    @ss_ns.doc(security="Bearer")
    @jwt_required()
    def put(self, id):
        ss = db.session.get(SessionsStudents, id)
        if not ss:
            return {"message": "SessionStudent not found"}, 404
        data = request.json
        ss.session_id = data.get("session_id", ss.session_id)
        ss.student_id = data.get("student_id", ss.student_id)
        db.session.commit()
        return {"message": f"SessionStudent {id} updated successfully", "results": ss.serialize()}, 200

    @ss_ns.doc(security="Bearer")
    @jwt_required()
    def delete(self, id):
        ss = db.session.get(SessionsStudents, id)
        if not ss:
            return {"message": "SessionStudent not found"}, 404
        db.session.delete(ss)
        db.session.commit()
        return {"message": f"SessionStudent {id} deleted successfully"}, 200


invitations_ns = Namespace('invitations', description='Invitation endpoints')

@invitations_ns.route('/')
class InvitationList(Resource):
    @invitations_ns.doc(security="Bearer")
    @jwt_required()
    def get(self):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        invitations = db.session.execute(db.select(Invitations)).scalars()
        results = [{
            "id": inv.id,
            "email": inv.email,
            "token": inv.token,
            "created_at": inv.created_at,
            "expires_at": inv.created_at + datetime.timedelta(hours=48)
        } for inv in invitations]
        return {"message": "Lista de invitaciones", "results": results}, 200

    @invitations_ns.doc(security="Bearer")
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        import pandas as pd
        file = request.files.get("file")
        if not file:
            return {"message": "Debe subir un archivo Excel con una columna 'email'"}, 400
        try:
            df = pd.read_excel(file, sheet_name=0)
            if 'email' not in df.columns:
                return {"message": "El archivo debe contener una columna llamada 'email'"}, 400
            emails = df['email'].dropna().tolist()
            if not emails:
                return {"message": "No se encontraron correos electrónicos válidos en el archivo"}, 400
        except Exception as e:
            return {"message": f"Error al procesar el archivo: {str(e)}"}, 400
        if not emails or not isinstance(emails, list):
            return {"message": "Debe proporcionar una lista de correos electrónicos"}, 400
        invitations_sent = []
        import traceback
        for email in emails:
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
                try:
                    send_invitation_email(email, link)
                except Exception as e:
                    invitations_sent.append({
                        "email": email,
                        "error": f"Fallo al enviar correo: {str(e)}"
                    })
                    continue
                invitations_sent.append({
                    "email": email,
                    "link": link,
                    "message": "Invitación enviada correctamente"
                })
            except Exception as e:
                error_trace = traceback.format_exc()
                invitations_sent.append({
                    "email": email,
                    "error": f"{str(e)}"
                })
        return {"message": "Invitaciones procesadas", "results": invitations_sent}, 200

@invitations_ns.route('/resend')
class InvitationResend(Resource):
    @invitations_ns.doc(security="Bearer")
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        data = request.json
        email = data.get("email")
        if not email:
            return {"message": "Email es requerido"}, 400
        invitation = db.session.execute(
            db.select(Invitations).where(Invitations.email == email)
        ).scalar()
        if not invitation:
            return {"message": "No se encontró invitación para este email"}, 404
        if (datetime.datetime.utcnow() - invitation.created_at).total_seconds() <= 172800:
            return {"message": "La invitación aún es válida"}, 400
        db.session.delete(invitation)
        db.session.commit()
        new_token = create_invitation(email)
        link = f"https://padelcoach.com/register?token={new_token}&email={email}"
        send_invitation_email(email, link)
        return {
            "message": "Invitación reenviada",
            "email": email,
            "link": link
        }, 200

# TrainingPlans Namespace and Models
trainingplans_ns = Namespace('training_plans', description='Training Plan endpoints')

trainingplan_model = trainingplans_ns.model('TrainingPlan', {
    'id': fields.Integer(description='Training Plan ID'),
    'title': fields.String(description='Título'),
    'description': fields.String(description='Descripción'),
    'file_url': fields.String(description='URL del documento'),
    'trainer_id': fields.Integer(description='ID de usuario del entrenador'),
    'created_at': fields.DateTime(description='Fecha de creación')
})

trainingplan_input_model = trainingplans_ns.model('TrainingPlanInput', {
    'title': fields.String(required=True, description='Título'),
    'description': fields.String(required=True, description='Descripción'),
    'file_url': fields.String(required=True, description='URL del documento'),
    'trainer_id': fields.Integer(required=True, description='ID de usuario del entrenador')
})

@trainingplans_ns.route('/')
class TrainingPlanList(Resource):
    @trainingplans_ns.doc(security="Bearer")
    @jwt_required()
    @trainingplans_ns.marshal_list_with(trainingplan_model)
    def get(self):
        plans = db.session.execute(db.select(TrainingPlan)).scalars()
        return {"message": "Lista de planes de entrenamiento", "results": [p.serialize() for p in plans]}, 200

    @trainingplans_ns.doc(security="Bearer")
    @jwt_required()
    @trainingplans_ns.expect(trainingplan_input_model)
    @trainingplans_ns.marshal_with(trainingplan_model, code=201)
    def post(self):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        data = request.json
        new_plan = TrainingPlan(
            title=data['title'],
            description=data['description'],
            file_url=data['file_url'],
            trainer_id=data['trainer_id']
        )
        db.session.add(new_plan)
        db.session.commit()
        return new_plan.serialize(), 201

@trainingplans_ns.route('/<int:id>')
class TrainingPlanDetail(Resource):
    @trainingplans_ns.doc(security="Bearer")
    @jwt_required()
    @trainingplans_ns.marshal_with(trainingplan_model)
    def get(self, id):
        plan = db.session.get(TrainingPlan, id)
        if not plan:
            trainingplans_ns.abort(404, "Training Plan no encontrado")
        return plan.serialize(), 200

    @trainingplans_ns.doc(security="Bearer")
    @jwt_required()
    @trainingplans_ns.expect(trainingplan_input_model)
    @trainingplans_ns.marshal_with(trainingplan_model)
    def put(self, id):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        plan = db.session.get(TrainingPlan, id)
        if not plan:
            trainingplans_ns.abort(404, "Training Plan no encontrado")
        data = request.json
        plan.title = data.get('title', plan.title)
        plan.description = data.get('description', plan.description)
        plan.file_url = data.get('file_url', plan.file_url)
        plan.trainer_id = data.get('trainer_id', plan.trainer_id)
        db.session.commit()
        return plan.serialize(), 200

    @trainingplans_ns.doc(security="Bearer")
    @jwt_required()
    def delete(self, id):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Usuario no autorizado"}, 403
        plan = db.session.get(TrainingPlan, id)
        if not plan:
            trainingplans_ns.abort(404, "Training Plan no encontrado")
        db.session.delete(plan)
        db.session.commit()
        return {"message": f"Training Plan {id} eliminado correctamente"}, 200