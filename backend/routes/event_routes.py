# Handles creating and viewing events

from flask import Blueprint, request, jsonify
from database import db
from models import Event, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS, cross_origin

event_routes = Blueprint("event_routes", __name__)


@event_routes.route("/events", methods=["GET", "OPTIONS"])  # ✅ FIXED ROUTE
@jwt_required()
def get_events():
    if request.method == "OPTIONS":  # ✅ Ensure preflight is properly handled
        response = jsonify({"message": "Preflight request successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")  # ✅ MUST be set explicitly
        return response, 200

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 403

    events = Event.query.all()

    response = jsonify({"events": [event.to_dict() for event in events]})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")  # ✅ Must always be included

    return response, 200


@event_routes.route("/create_event", methods=["OPTIONS"])
@cross_origin()
def preflight_create_event():
    response = jsonify({"message": "Preflight request successful"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")  # ✅ Allow credentials
    return response, 200

@event_routes.route("/create_event", methods=["POST"])
@jwt_required()
def create_event():
    data = request.json
    user_id = get_jwt_identity()

    # Find the user
    user = User.query.get(user_id)
    if not user or user.role not in ["vp", "admin"]:
        return jsonify({"error": "Only Vice Presidents and Admins can create events"}), 403

    # Ensure the user has a chapter
    #if not user.chapter_id:
        #return jsonify({"error": "User is not associated with any chapter"}), 400

    # Ensure all fields are present
    required_fields = ["name", "description", "date", "location", "eventType"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Create the event linked to the user's chapter
    new_event = Event(
        name=data["name"],
        description=data["description"],
        date=data["date"],
        location=data["location"],
        eventType=data["eventType"],
    )
    db.session.add(new_event)
    db.session.commit()

    response = jsonify({
        "message": "Event created successfully",
        "id": new_event.id
    })

    # ✅ Set CORS headers manually
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")

    return response, 201

@event_routes.route("/edit_event/<int:event_id>", methods=["OPTIONS"])
@cross_origin()
def preflight_edit_event(event_id):
    response = jsonify({"message": "Preflight request successful"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Methods", "PUT, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200

@event_routes.route("/edit_event/<int:event_id>", methods=["PUT"])
@jwt_required()
def edit_event(event_id):
    data = request.json
    user_id = get_jwt_identity()

    # Find the user
    user = User.query.get(user_id)
    if not user or user.role not in ["vp", "admin"]:
        return jsonify({"error": "Only Vice Presidents and Admins can edit events"}), 403

    # Ensure all fields are present
    required_fields = ["name", "description", "date", "location", "eventType"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Find the event to edit
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Update event details
    event.name = data["name"]
    event.description = data["description"]
    event.date = data["date"]
    event.location = data["location"]
    event.eventType = data["eventType"]

    db.session.commit()

    response = jsonify({"message": "Event updated successfully"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")

    return response, 200



