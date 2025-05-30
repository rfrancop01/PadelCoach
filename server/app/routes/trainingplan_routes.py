

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import TrainingPlan
from .. import db

trainingplan_routes = Blueprint('trainingplan_routes', __name__)

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
    data = request.json
    new_plan = TrainingPlan(
        title=data['title'],
        description=data['description'],
        file_url=data['file_url'],
        trainer_id=data['trainer_id']
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
    data = request.json
    plan.title = data.get('title', plan.title)
    plan.description = data.get('description', plan.description)
    plan.file_url = data.get('file_url', plan.file_url)
    plan.trainer_id = data.get('trainer_id', plan.trainer_id)
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
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": f"Training Plan {id} eliminado correctamente"}), 200