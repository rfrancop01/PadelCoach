from datetime import datetime
from . import db
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Enum, func

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)  # URL de la foto de perfil del usuario
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(
        Enum('admin', 'trainer', 'student', name='role_enum'),
        nullable=False,
        default='student',
        server_default='student'
    )
    is_active = db.Column(db.Boolean, default=True)  # Estado del usuario: activo o inactivo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User: {self.id} - {self.email} - Role: {self.role}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'photo_url': self.photo_url,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime("%d/%m/%Y %H:%M") if self.created_at else None,
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    """ def add_user():
        pass """

class Students(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.Enum('Primera', 'Segunda', 'Tercera', 'Cuarta', 'Iniciación', 'Competición', name='level_enum'), nullable=False)  # Nivel del estudiante
    age = db.Column(db.Integer, nullable=False)
    student_associations = db.relationship(
        'SessionsStudents',
        back_populates='student',
        cascade="all, delete-orphan",
        overlaps="sessions,student_associations"
    )
    sessions = db.relationship(
        'Sessions',
        secondary='sessions_students',
        back_populates='students',
        overlaps="session_associations,students"
    )
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id], backref='student_profile')

    def __repr__(self):
        return f'<Student {self.id} {self.level}>'

    def serialize(self):
        return {
            'id': self.id,
            'level': self.level,
            'age': self.age,
            'user': self.user_to.serialize() if self.user_to else None
        }

class Trainers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sessions = db.relationship('Sessions', backref='trainer')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id], backref='trainer_profile')

    def __repr__(self):
        return f'<Trainer {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'user': self.user_to.serialize() if self.user_to else None
        }

    training_plans = db.relationship(
        'TrainingPlan',
        back_populates='trainer',
        cascade='all, delete-orphan'
    )

class Courts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    court_type = db.Column(db.Enum('indoor', 'outdoor', name='court_type_enum'), nullable=False)
    location = db.Column(db.String(255), nullable=False) 
    sessions = db.relationship('Sessions', backref='court')

    def __repr__(self):
        return f'<Court {self.id} {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'court_type': self.court_type,
            'location': self.location
        }

class Sessions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.String(5), nullable=False)  # Hora en formato 'HH:MM'
    notes = db.Column(db.String(255), nullable=True)  # Notas del entrenador sobre la sesión
    court_id = db.Column(db.Integer, db.ForeignKey('courts.id'), nullable=False)
    session_associations = db.relationship(
        'SessionsStudents',
        back_populates='session',
        cascade="all, delete-orphan",
        overlaps="students,session_associations"
    )
    students = db.relationship(
        'Students',
        secondary='sessions_students',
        back_populates='sessions',
        overlaps="session_associations,student_associations"
    )

    def __repr__(self):
        return f'<Session {self.id} {self.date} {self.time}>'

    def serialize(self):
        return {
            'id': self.id,
            'trainer_id': self.trainer_id,
            'date': self.date.strftime("%d/%m/%Y %H:%M") if self.date else None,
            'time': self.time,
            'court_id': self.court_id,
            'court_name': self.court.name if self.court else None,
            'notes': self.notes
        }

class SessionsStudents(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    session = db.relationship(
        'Sessions',
        back_populates='session_associations',
        overlaps="students,session_associations"
    )
    student = db.relationship(
        'Students',
        back_populates='student_associations',
        overlaps="sessions,student_associations"
    )

    def __repr__(self):
        return f'<SessionStudent {self.id} session_id={self.session_id} student_id={self.student_id}>'

    def serialize(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id
        }

class Invitations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    token = db.Column(db.Text, unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    used = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' o 'trainer'

    def __repr__(self):
        return f'<Invitation {self.id} - {self.email} - Role: {self.role}>'

    def serialize(self):
        return {
            'id': self.id,
            'email': self.email,
            'token': self.token,
            'created_at': self.created_at.strftime("%d/%m/%Y %H:%M") if self.created_at else None,
            'expires_at': self.expires_at.strftime("%d/%m/%Y %H:%M") if self.expires_at else None,
            'used': self.used,
            'role': self.role
        }
class TrainingPlan(db.Model):
    __tablename__ = 'training_plans'

    id = db.Column(db.Integer, primary_key=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_url = db.Column(db.String(255), nullable=False)  # URL to the uploaded plan file
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=func.now()
    )

    trainer = db.relationship(
        'Trainers',
        back_populates='training_plans'
    )

    def __repr__(self):
        return f'<TrainingPlan {self.id} "{self.title}">'

    def serialize(self):
        return {
            'id': self.id,
            'trainer_id': self.trainer_id,
            'title': self.title,
            'description': self.description,
            'file_url': self.file_url,
            'created_at': self.created_at.strftime("%d/%m/%Y %H:%M") if self.created_at else None
        }

class PasswordResetToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(128), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    used = db.Column(db.Boolean, default=False)

    user = db.relationship('Users', backref='reset_tokens')

    def __repr__(self):
        return f'<PasswordResetToken {self.id} for user {self.user_id}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'token': self.token,
            'created_at': self.created_at.strftime("%d/%m/%Y %H:%M") if self.created_at else None,
            'used': self.used
        }