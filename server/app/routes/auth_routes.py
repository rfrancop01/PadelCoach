from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, create_access_token
import datetime, secrets
from ..models import Users, Invitations, PasswordResetToken
from .. import db
from ..invitation_utils import send_invitation_email, create_invitation

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/login', methods=['POST'])
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

@auth_routes.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    claims = get_jwt()
    return jsonify({
        "message": f"Logged as {current_user}",
        "user_id": claims.get("user_id"),
        "role": claims.get("role")
    }), 200

@auth_routes.route('/signup', methods=['POST'])
def signup():
    data = request.json
    token = data.get("token")
    password = data.get("password")
    name = data.get("name", "")
    last_name = data.get("last_name", "")
    phone = data.get("phone", "")
    role = data.get("role", "student")
    allowed_roles = {"admin", "trainer", "student"}

    if not token or not password:
        return jsonify({"message": "Token y password son requeridos"}), 400

    invitation = db.session.execute(
        db.select(Invitations).where(Invitations.token == token)
    ).scalar()

    if not invitation:
        return jsonify({"message": "Invitación no válida o token incorrecto"}), 400
    if (datetime.datetime.utcnow() - invitation.created_at).total_seconds() > 172800:
        return jsonify({"message": "El enlace de invitación ha expirado"}), 400
    if invitation.used:
        return jsonify({"message": "La invitación ya ha sido utilizada"}), 400

    email = invitation.email

    if role not in allowed_roles:
        return jsonify({"message": "Rol inválido. Debe ser uno de: admin, trainer, student"}), 400

    existing_user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if existing_user:
        return jsonify({"message": "El usuario ya existe"}), 409

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

    if role == "student":
        from ..models import Students
        if invitation.level:
            new_student = Students(user_id=new_user.id, level=invitation.level)
            db.session.add(new_student)

    invitation.used = True
    db.session.commit()

    return jsonify({"message": "Usuario creado exitosamente", "results": new_user.serialize()}), 201

@auth_routes.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    data = request.json
    email = data.get('email')
    user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if not user:
        return jsonify({"message": "No se encontró usuario con ese email"}), 404

    token = secrets.token_urlsafe(32)
    prt = PasswordResetToken(user_id=user.id, token=token)
    db.session.add(prt)
    db.session.commit()

    reset_link = f"http://localhost:5174/reset-password?token={token}"
    try:
        send_invitation_email(
            email,
            f"Hola {user.name},\n\n"
            f"Haz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_link}\n\n"
            "Si no solicitaste este cambio, ignora este mensaje."
        )
    except Exception as e:
        return jsonify({"message": f"Error al enviar el correo: {str(e)}"}), 500

    return jsonify({"message": "Correo de restablecimiento enviado"}), 200

@auth_routes.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password = data.get("new_password")

    record = db.session.execute(
        db.select(PasswordResetToken).where(PasswordResetToken.token == token)
    ).scalar()

    if not record:
        return jsonify({"message": "Token inválido"}), 400

    if record.used:
        return jsonify({"message": "El token ya ha sido utilizado"}), 400

    if (datetime.datetime.utcnow() - record.created_at).total_seconds() > 1800:
        return jsonify({"message": "El token ha expirado"}), 400

    user = db.session.get(Users, record.user_id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    user.set_password(new_password)
    record.used = True
    db.session.commit()

    return jsonify({"message": "Contraseña actualizada correctamente"}), 200