from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import Trainers, Users
from .. import db

trainer_routes = Blueprint('trainer_routes', __name__)

@trainer_routes.route('/', methods=['GET'])
@jwt_required()
def list_trainers():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    trainers = db.session.execute(db.select(Trainers)).scalars()
    result = []
    for trainer in trainers:
        data = trainer.serialize()
        user = db.session.get(Users, trainer.user_id)
        data['user'] = user.serialize() if user else None
        data.pop('user_id', None)
        data.pop('is_active', None)
        result.append(data)
    return jsonify({"message": "Lista de entrenadores", "results": result}), 200

@trainer_routes.route('/', methods=['POST'])
@jwt_required()
def create_trainer():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"message": "user_id is required"}), 400
    new_trainer = Trainers(user_id=user_id)
    db.session.add(new_trainer)
    db.session.commit()
    return jsonify({"message": "Trainer created successfully", "results": new_trainer.serialize()}), 201

@trainer_routes.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_trainer(id):
    trainer = db.session.get(Trainers, id)
    if not trainer:
        return jsonify({"message": "Trainer not found"}), 404
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    if claims.get("role") != "admin" and trainer.user_id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403
    return jsonify({"message": f"Trainer {id} found", "results": trainer.serialize()}), 200

@trainer_routes.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_trainer(id):
    trainer = db.session.get(Trainers, id)
    if not trainer:
        return jsonify({"message": "Trainer not found"}), 404
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    if claims.get("role") != "admin" and trainer.user_id != current_user_id:
        return jsonify({"message": "Usuario no autorizado"}), 403
    data = request.json
    if "is_active" in data:
        trainer.is_active = data["is_active"]
    db.session.commit()
    return jsonify({"message": f"Trainer {id} updated successfully", "results": trainer.serialize()}), 200

@trainer_routes.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_trainer(id):
    trainer = db.session.get(Trainers, id)
    if not trainer:
        return jsonify({"message": "Trainer not found"}), 404
    claims = get_jwt()
    current_user_id = claims.get("user_id")
    if claims.get("role") != "admin":
        return jsonify({"message": "Usuario no autorizado"}), 403
    trainer.is_active = False
    db.session.commit()
    return jsonify({"message": f"Trainer {id} deactivated successfully"}), 200