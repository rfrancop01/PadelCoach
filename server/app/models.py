from datetime import datetime
from . import db
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'admin', 'trainer', 'student'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One-to-one relationship with Student and Trainer
    student = db.relationship('Student', back_populates='user', uselist=False)
    trainer = db.relationship('Trainer', back_populates='user', uselist=False)

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    level = db.Column(db.String(50), nullable=False)  # 'beginner', 'intermediate', 'advanced'
    age = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)  # Track if the student is active or not

    # One-to-one relationship with User (student is a user)
    user = db.relationship('User', back_populates='student')

    # Many-to-many relationship with sessions
    sessions = db.relationship('Session', secondary='sessions_students', back_populates='students')

class Trainer(db.Model):
    __tablename__ = 'trainers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    experience = db.Column(db.String(255), nullable=True)  # Experience of the trainer
    is_active = db.Column(db.Boolean, default=True)  # Track if the trainer is active or not

    # One-to-one relationship with User (trainer is a user)
    user = db.relationship('User', back_populates='trainer')

    # Many-to-many relationship with sessions
    sessions = db.relationship('Session', backref='trainer')

class Court(db.Model):
    __tablename__ = 'courts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'indoor' or 'outdoor'
    location = db.Column(db.String(255), nullable=False)  # Address or coordinates of the court

    # One-to-many relationship with sessions
    sessions = db.relationship('Session', backref='court')

class Session(db.Model):
    __tablename__ = 'sessions'

    id = db.Column(db.Integer, primary_key=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Trainer is a user
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.String(5), nullable=False)  # Time in 'HH:MM' format
    location = db.Column(db.String(100), nullable=False)  # Court for the session
    notes = db.Column(db.String(255), nullable=True)  # General notes about the session

    # Relationship with trainer
    trainer = db.relationship('User', backref='sessions')

    # Many-to-many relationship with students through the intermediate table
    students = db.relationship('Student', secondary='sessions_students', back_populates='sessions')

class SessionStudent(db.Model):
    __tablename__ = 'sessions_students'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)

    # Relationship with session
    session = db.relationship('Session', back_populates='students')

    # Relationship with student
    student = db.relationship('Student')