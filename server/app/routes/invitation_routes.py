from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import Invitations
from .. import db
from ..invitation_utils import create_invitation, send_invitation_email
import datetime
import pandas as pd
import traceback

invitation_routes = Blueprint('invitation_routes', __name__)

@invitation_routes.route('', methods=['GET'])
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
        "expires_at": inv.created_at + datetime.timedelta(hours=48),
        "is_used": inv.used,
        "level": inv.level
    } for inv in invitations]
    return jsonify({"message": "Lista de invitaciones", "results": results}), 200

@invitation_routes.route('', methods=['POST'])
@jwt_required()
def upload_invitations():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    file = request.files.get("file")
    if not file:
        return jsonify({"message": "Debe subir un archivo Excel con una columna 'email'"}), 400
    try:
        df = pd.read_excel(file, sheet_name=0)
        if 'email' not in df.columns or 'level' not in df.columns:
            return jsonify({"message": "El archivo debe contener columnas llamadas 'email' y 'level'"}), 400
        invitations_data = df[['email', 'level']].dropna().to_dict(orient='records')
        if not invitations_data:
            return jsonify({"message": "No se encontraron datos válidos en el archivo"}), 400
    except Exception as e:
        return jsonify({"message": f"Error al procesar el archivo: {str(e)}"}), 400
    invitations_sent = []
    for item in invitations_data:
        email = item['email']
        level = item['level']
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
            token = create_invitation(email, role="student", level=level)
            link = f"http://localhost:5174/register?token={token}&email={email}"
            send_invitation_email(email, link)
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
    return jsonify({"message": "Invitaciones procesadas", "results": invitations_sent}), 200

@invitation_routes.route('/resend', methods=['POST'])
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
    db.session.delete(invitation)
    db.session.commit()
    new_token = create_invitation(email, role="student", level=invitation.level)
    link = f"http://localhost:5174/signup?token={new_token}&email={email}"
    send_invitation_email(email, link)
    return jsonify({
        "message": "Invitación reenviada",
        "email": email,
        "link": link
    }), 200