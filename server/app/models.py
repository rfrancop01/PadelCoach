from datetime import datetime
from . import db
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)  # URL de la foto de perfil del usuario
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # Rol del usuario: 'admin', 'trainer', 'student'
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
            'created_at': self.created_at,
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Students(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.Enum('Primera', 'Segunda', 'Tercera', 'Cuarta', 'Iniciación', 'Competición', name='level_enum'), nullable=False)  # Nivel del estudiante
    age = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)  # Estado del estudiante: activo o inactivo
    sessions = db.relationship('Sessions', secondary='sessions_students', back_populates='students')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id], backref='student_profile')

    def __repr__(self):
        return f'<Student {self.id} {self.level}>'

    def serialize(self):
        return {
            'id': self.id,
            'level': self.level,
            'age': self.age,
            'is_active': self.is_active,
            'user': self.user_to.serialize() if self.user_to else None
        }

class Trainers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    is_active = db.Column(db.Boolean, default=True)  # Estado del entrenador: activo o inactivo
    sessions = db.relationship('Sessions', backref='trainer')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id], backref='trainer_profile')

    def __repr__(self):
        return f'<Trainer {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'is_active': self.is_active,
            'user': self.user_to.serialize() if self.user_to else None
        }

class Courts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.Enum('indoor', 'outdoor', name='court_type_enum'), nullable=False)
    location = db.Column(db.String(255), nullable=False) 
    sessions = db.relationship('Sessions', backref='court')

    def __repr__(self):
        return f'<Court {self.id} {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'location': self.location
        }

class Sessions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.String(5), nullable=False)  # Hora en formato 'HH:MM'
    notes = db.Column(db.String(255), nullable=True)  # Notas del entrenador sobre la sesión
    court_id = db.Column(db.Integer, db.ForeignKey('courts.id'), nullable=False)
    trainer = db.relationship('Users', foreign_keys=[trainer_id], backref='sessions')
    students = db.relationship('Students', secondary='sessions_students', back_populates='sessions')

    def __repr__(self):
        return f'<Session {self.id} {self.date} {self.time}>'

    def serialize(self):
        return {
            'id': self.id,
            'trainer_id': self.trainer_id,
            'date': self.date,
            'time': self.time,
            'court_id': self.court_id,
            'court_name': self.court.name if self.court else None,
            'notes': self.notes
        }

class SessionsStudents(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    session = db.relationship('Sessions', foreign_keys=[session_id], backref='sessions_students')
    student = db.relationship('Students', foreign_keys=[student_id], backref='sessions_students')

    def __repr__(self):
        return f'<SessionStudent {self.id} session_id={self.session_id} student_id={self.student_id}>'

    def serialize(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id
        }