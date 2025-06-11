

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from flask_jwt_extended import jwt_required, get_jwt
from flask import send_from_directory

from ..models import TrainingPlan
from .. import db

trainingplan_routes = Blueprint('trainingplan_routes', __name__)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    filename = secure_filename(file.filename)
    upload_folder = os.path.join(current_app.static_folder, 'uploads', 'trainingplans')
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    return f'/uploads/trainingplans/{filename}'

@trainingplan_routes.route('/', methods=['GET'])
@jwt_required()
def list_trainingplans():
    claims = get_jwt()
    if claims.get("role") not in {"admin", "trainer"}:
        return jsonify({"message": "Usuario no autorizado"}), 403

    plans = db.session.execute(db.select(TrainingPlan)).scalars()
    return jsonify({
        "message": "Lista de planes de entrenamiento",
        "results": [p.serialize() for p in plans]
    }), 200

@trainingplan_routes.route('/', methods=['POST'])
@jwt_required()
def create_trainingplan():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    title = request.form.get('title')
    description = request.form.get('description')
    file = request.files.get('file')

    if not title or not file or not allowed_file(file.filename):
        return jsonify({"message": "Título y archivo PDF son requeridos"}), 400

    file_url = save_file(file)

    new_plan = TrainingPlan(
        title=title,
        description=description,
        file_url=file_url,
        trainer_id=None
    )
    db.session.add(new_plan)
    db.session.commit()
    return jsonify(new_plan.serialize()), 201

@trainingplan_routes.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_trainingplan(id):
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")
    
    plan = db.session.get(TrainingPlan, id)
    if not plan:
        return jsonify({"message": "Training Plan no encontrado"}), 404

    if role not in {"admin", "trainer"}:
        return jsonify({"message": "Usuario no autorizado"}), 403

    return jsonify(plan.serialize()), 200

@trainingplan_routes.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_trainingplan(id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    plan = db.session.get(TrainingPlan, id)
    if not plan:
        return jsonify({"message": "Training Plan no encontrado"}), 404

    title = request.form.get('title', plan.title)
    description = request.form.get('description', plan.description)
    file = request.files.get('file')

    plan.title = title
    plan.description = description
    if file and allowed_file(file.filename):
        plan.file_url = save_file(file)
    plan.trainer_id = None

    db.session.commit()
    return jsonify(plan.serialize()), 200

@trainingplan_routes.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_trainingplan(id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    plan = db.session.get(TrainingPlan, id)
    if not plan:
        return jsonify({"message": "Training Plan no encontrado"}), 404
    # Borrar archivo PDF correspondiente si existe
    if plan.file_url:
        file_path = os.path.join(current_app.static_folder, plan.file_url.replace('/uploads/', ''))
        if os.path.exists(file_path):
            os.remove(file_path)
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": f"Training Plan {id} eliminado correctamente"}), 200
