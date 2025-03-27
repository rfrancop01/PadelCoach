from datetime import datetime
from . import db

# Modelo para Usuarios (entrenador, alumno o administrador)
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Role: 'admin', 'profesor', 'alumno'
    role = db.Column(db.String(50), nullable=False, default='alumno')
    
    def __repr__(self):
        return f'<User {self.name}, Role {self.role}>'

# Modelo de Alumno
class Alumno(db.Model):
    __tablename__ = 'alumnos'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Relacionado con User
    nivel = db.Column(db.String(50))
    fecha_nacimiento = db.Column(db.Date)
    
    user = db.relationship('User', backref=db.backref('alumno', uselist=False))  # Relación inversa
    
    def __repr__(self):
        return f'<Alumno {self.user.name}, Nivel {self.nivel}>'

# Modelo de Sesion
class Sesion(db.Model):
    __tablename__ = 'sesiones'
    
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, nullable=False)
    pista = db.Column(db.String(100))  # Puede extenderse más tarde con un modelo Pista
    notas = db.Column(db.Text)
    
    alumno_id = db.Column(db.Integer, db.ForeignKey('alumnos.id'), nullable=False)
    entrenador_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Relación con `User`
    
    alumno = db.relationship('Alumno', backref=db.backref('sesiones'))
    entrenador = db.relationship('User', backref=db.backref('sesiones_entrenador'))
    
    def __repr__(self):
        return f'<Sesion {self.id}, Fecha {self.fecha}>'

# Modelo Pista (opcional si quieres hacer más complejo)
class Pista(db.Model):
    __tablename__ = 'pistas'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50))  # Puede ser 'indoor' o 'outdoor'
    club = db.Column(db.String(100))
    
    def __repr__(self):
        return f'<Pista {self.nombre}, Tipo {self.tipo}>'