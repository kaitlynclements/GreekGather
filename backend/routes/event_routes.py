# Handles creating and viewing events

from flask import Blueprint, request, jsonify
from database import db
from models import Event, User
from flask_jwt_extended import jwt_required, get_jwt_identity

event_routes = Blueprint("event_routes", __name__)


# ✅ Allow only VPs to create events
@event_routes.route("/create_event", methods=["POST"])
@jwt_required()
def create_event():
    data = request.json
    user_id = get_jwt_identity()

    # Find user
    user = User.query.get(user_id)
    if not user or user.role != "vp":
        return jsonify({"error": "Only Vice Presidents can create events"}), 403

    # Create event
    new_event = Event(name=data["name"], date=data["date"])
    db.session.add(new_event)
    db.session.commit()

    return jsonify({"message": "Event created successfully"})
