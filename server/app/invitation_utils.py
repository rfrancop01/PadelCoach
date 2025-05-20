import smtplib
from itsdangerous import URLSafeTimedSerializer
from email.message import EmailMessage
from flask import current_app
from datetime import datetime, timedelta
from .models import Invitations
from . import db

def generate_invite_token(email):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt="invite-salt")

def validate_invite_token(token, max_age=86400):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        return serializer.loads(token, salt="invite-salt", max_age=max_age)
    except Exception:
        return None

def send_invite_email(to_email, invite_url):
    msg = EmailMessage()
    msg["Subject"] = "Te han invitado a PadelCoach 🎾"
    msg["From"] = current_app.config["SMTP_USER"]
    msg["To"] = to_email
    msg.set_content(f"""
Hola!

Has sido invitado a registrarte en la plataforma PadelCoach.

Haz clic en este enlace para completar tu registro:
{invite_url}

Este enlace caduca en 24h.

Saludos,
El equipo de PadelCoach.
""")

    with smtplib.SMTP(current_app.config["SMTP_SERVER"], int(current_app.config["SMTP_PORT"])) as smtp:
        smtp.starttls()
        smtp.login(current_app.config["SMTP_USER"], current_app.config["SMTP_PASSWORD"])
        try:
            smtp.send_message(msg)
        except Exception as e:
            print(f"Error al enviar el correo a {to_email}: {e}")

def create_invitation(email, role="student"):
    token = generate_invite_token(email)
    expires_at = datetime.utcnow() + timedelta(hours=24)

    invitation = Invitations(email=email, token=token, expires_at=expires_at, role=role)
    db.session.add(invitation)
    db.session.commit()

    return token

send_invitation_email = send_invite_email