'''
Name: event_routes.py
Description: handles on backend routes for event creation, viewing events and editing events.
Programmer's Names: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muelebach
Date Created: 2/2/2025
Last Revised: see github commits
Revisions: [date]: [description] (author)
Preconditions: event name, date, time, location
acceptable inputs: text based name, valid date and time, text based location
unacceptable inputs: invalidly formatted dates or times
postconditions: does backend task or sends JSON error message
return values: JSON messages
Side Effects: events added or updated in event database table
Any known faults: edit event not fully implemented/functioning yet
'''

# Handles creating and viewing events

from flask import Blueprint, request, jsonify
from database import db
from models import Event, User, RSVP
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS, cross_origin

event_routes = Blueprint("event_routes", __name__)


@event_routes.route("/events", methods=["GET", "OPTIONS"])  # FIXED ROUTE
@jwt_required()
def get_events(): 
    if request.method == "OPTIONS":  # Ensure preflight is properly handled
        response = jsonify({"message": "Preflight request successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")  # Must be set explicitly
        return response, 200

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 403

    events = Event.query.all()

    response = jsonify({"events": [event.to_dict() for event in events]})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")  # Must always be included

    return response, 200


@event_routes.route("/create_event", methods=["OPTIONS"])
@cross_origin()
def preflight_create_event():
    response = jsonify({"message": "Preflight request successful"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")  # Allow credentials
    return response, 200

@event_routes.route("/create_event", methods=["POST"])
@jwt_required()
def create_event():
    data = request.json
    user_id = get_jwt_identity()

    # Find the user
    user = User.query.get(user_id)
    if not user or user.role not in ["exec", "admin"]:
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

    # Set CORS headers manually
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
    if not user or user.role not in ["exec", "admin"]:
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


@event_routes.route("/delete_event/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()

    # Find the user
    user = User.query.get(user_id)
    if not user or user.role not in ["exec", "admin"]:
        return jsonify({"error": "Only Vice Presidents and Admins can delete events"}), 403

    # Find the event
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()

    response = jsonify({"message": "Event deleted successfully"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")

    return response, 200

@event_routes.route("/events_by_date/<string:date>", methods=["GET"])
@jwt_required()
def get_events_by_date(date):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 403

    events = Event.query.filter(Event.date.startswith(date)).all()

    response = jsonify({"events": [event.to_dict() for event in events]})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")

    return response, 200


@event_routes.route("/rsvp", methods=["POST"])
@jwt_required()
def rsvp_event():
    data = request.json
    user_id = get_jwt_identity()

    required_fields = ["event_id", "attending", "guests"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Check if RSVP already exists
    rsvp = RSVP.query.filter_by(user_id=user_id, event_id=data["event_id"]).first()

    if rsvp:
        rsvp.attending = data["attending"]
        rsvp.guests = data["guests"]
    else:
        rsvp = RSVP(
            user_id=user_id,
            event_id=data["event_id"],
            attending=data["attending"],
            guests=data["guests"]
        )
        db.session.add(rsvp)

    db.session.commit()
    return jsonify({"message": "RSVP recorded successfully"}), 200


@event_routes.route("/rsvp_count/<int:event_id>", methods=["GET"])
@jwt_required()
def get_rsvp_count(event_id):
    rsvps = RSVP.query.filter_by(event_id=event_id, attending=True).all()
    total_attendees = sum([rsvp.guests + 1 for rsvp in rsvps])  # Including RSVP user

    return jsonify({"event_id": event_id, "total_attendees": total_attendees})



