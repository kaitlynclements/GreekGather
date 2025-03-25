'''
Name: auth_routes.py
Description: handles on backend routes for user authentication, registration, login, password validation, and chapter creation.
Programmer's Names: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muelebach
Date Created: 2/2/2025
Last Revised: refer to github commits
Revisions: [revisor name]/[revision date]: [Description]
Preconditions: username and password, Organization Name and chapter
Acceptable inputs: valid username and password matching with database, chapter and organizations that do not already exist
unacceptable inputs: invalid password or username, password not meeting requirements for registration, chapters that already exist in database
Postconditions: does backend task or sends JSON error message
Return values: Json messages
Side Effects: things added to database tables
Any known faults: none
'''

# Handles user registration & login

from flask import Blueprint, request, jsonify
from database import db
from models import User, Chapter, JoinRequest, StudySession, ServiceHour
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re
from datetime import datetime, timedelta
from flask_cors import CORS

auth_routes = Blueprint("auth", __name__)
CORS(auth_routes, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Password validation function
def is_valid_password(password):
    return (
        len(password) >= 8 and
        any(char.isdigit() for char in password) and
        any(char.islower() for char in password) and
        any(char.isupper() for char in password) and
        any(char in "!@#$%^&*()-_+=<>?/" for char in password)
    )

# Fetch all Chapters (Fixes dropdown issue)
@auth_routes.route("/get_chapters", methods=["GET"])
def get_chapters():
    chapters = Chapter.query.all()

    if not chapters:
        return jsonify({"chapters": []})  # Return empty list instead of error

    return jsonify(
        {
            "chapters": [
                {
                    "id": c.id,
                    "organization_name": c.organization_name,
                    "chapter_name": c.chapter_name,
                }
                for c in chapters
            ]
        }
    )


# User Registration
@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    # Validate email format
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format"}), 400

    # Validate password strength
    if not is_valid_password(password):
        return jsonify({"error": "Password must be at least 8 characters long, contain at least one digit, one lowercase letter, one uppercase letter, and one special character."}), 400

    new_user = User(name=name, email=email)
    new_user.set_password(password)  # Using the new set_password method

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        "token": access_token,
        "role": new_user.role,
        "chapter_id": new_user.chapter_id,
        "message": "Registration successful"
    })

@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))

        print(f"DEBUG: Logging in {user.email} with chapter_id {user.chapter_id}")  # Debugging

        return jsonify({
            "token": access_token,
            "role": user.role,
            "chapter_id": user.chapter_id if user.chapter_id else None  # ✅ Ensure this is returned
        })

    return jsonify({"error": "Invalid credentials"}), 401


# Create a New Chapter (Only Admins)
@auth_routes.route("/create_chapter", methods=["POST"])
@jwt_required()
def create_chapter():
    try:
        data = request.json
        user_id = int(get_jwt_identity())

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        organization_name = data.get("organization_name")
        chapter_name = data.get("chapter_name")

        if not organization_name or not chapter_name:
            return jsonify({"error": "Missing required fields"}), 422

        # Ensure the chapter does not already exist
        if Chapter.query.filter_by(organization_name=organization_name, chapter_name=chapter_name).first():
            return jsonify({"error": "Chapter already exists"}), 400

        # Create new chapter and assign admin
        new_chapter = Chapter(
            organization_name=organization_name,
            chapter_name=chapter_name,
            admin_id=user.id
        )
        db.session.add(new_chapter)
        db.session.commit()  # ✅ Commit the new chapter first

        # ✅ Now assign chapter_id to the user and commit the change
        user.role = "admin"
        user.chapter_id = new_chapter.id
        db.session.commit()  # ✅ Commit again to update the user

        print(f"DEBUG: Created chapter {new_chapter.id} and assigned user {user.email} to it.")

        return jsonify({
            "message": f"Chapter {organization_name} - {chapter_name} created successfully",
            "chapter_id": new_chapter.id,
        })
    except Exception as e:
        db.session.rollback()
        print("Error creating chapter:", str(e))  # Debug print
        return jsonify({"error": str(e)}), 422


# Join an Existing Chapter
@auth_routes.route("/join_chapter", methods=["POST"])
@jwt_required()
def join_chapter():
    data = request.json
    user_id = get_jwt_identity()

    user = User.query.get(user_id)
    chapter = Chapter.query.filter_by(chapter_name=data.get("chapter_name")).first()

    if not chapter:
        return jsonify({"error": "Chapter not found"}), 404

    # ✅ Assign chapter_id when user joins
    user.chapter_id = chapter.id
    db.session.commit()  # ✅ Ensure commit

    print(f"DEBUG: User {user.email} joined chapter {chapter.id}")

    return jsonify({"message": "Joined chapter successfully", "chapter_id": chapter.id})


# Assign a Role (Only Admins)
@auth_routes.route("/assign_role", methods=["POST"])
@jwt_required()
def assign_role():
    data = request.json
    target_email = data.get("user_email")
    new_role = data.get("role")
    admin_id = get_jwt_identity()

    # Verify admin
    admin = User.query.get(admin_id)
    if not admin or admin.role != "admin":
        return jsonify({"error": "Only admins can assign roles"}), 403

    # Find user and assign new role
    user = User.query.filter_by(email=target_email).first()
    if not user or user.chapter_id != admin.chapter_id:
        return jsonify({"error": "User not found or not in the same chapter"}), 404

    user.role = new_role
    db.session.commit()

    return jsonify(
        {"message": f"{user.name} is now a {new_role} in {admin.chapter.name}"}
    )


@auth_routes.route("/request_join_chapter", methods=["POST"])
@jwt_required()
def request_join_chapter():
    data = request.json
    user_id = get_jwt_identity()
    chapter_id = data.get("chapter_id")

    if not chapter_id:
        return jsonify({"error": "Chapter ID is required"}), 400

    chapter = Chapter.query.get(chapter_id)
    if not chapter:
        return jsonify({"error": "Chapter not found"}), 404

    # Check if a request already exists
    existing_requests = JoinRequest.query.filter_by(
        user_id=user_id, chapter_id=chapter_id
    ).all()
    
    if existing_requests:
        return jsonify({"error": "You have already requested to join this chapter"}), 400

    join_request = JoinRequest(user_id=user_id, chapter_id=chapter_id)
    db.session.add(join_request)
    db.session.commit()

    return jsonify({"message": "Join request sent to chapter admin for approval"})


@auth_routes.route("/approve_join_request/<int:request_id>", methods=["POST"])
@jwt_required()
def approve_join_request(request_id):
    admin_id = get_jwt_identity()
    join_request = JoinRequest.query.get(request_id)

    if not join_request:
        return jsonify({"error": "Join request not found"}), 404

    # Ensure only the chapter admin can approve requests
    chapter = Chapter.query.get(join_request.chapter_id)
    if chapter.admin_id != admin_id:
        return (
            jsonify({"error": "Only the chapter admin can approve join requests"}),
            403,
        )

    join_request.status = "approved"
    user = User.query.get(join_request.user_id)
    user.chapter_id = join_request.chapter_id  # Assign user to chapter

    db.session.commit()
    return jsonify(
        {
            "message": f"{user.name} has been approved to join {chapter.organization_name} - {chapter.chapter_name}"
        }
    )

from sqlalchemy import text  # Import text for raw SQL queries

@auth_routes.route("/membership_requests", methods=["GET"])
@jwt_required()
def get_membership_requests():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)

    if not admin:
        print("DEBUG: User not found")
        return jsonify({"error": "User not found"}), 404

    if admin.role != "admin":
        print("DEBUG: Unauthorized access attempt")
        return jsonify({"error": "Unauthorized"}), 403

    if not admin.chapter_id:
        print(f"DEBUG: Admin {admin.email} does not have a chapter_id")
        return jsonify({"error": "Admin is not associated with any chapter"}), 400

    try:
        requests = db.session.execute(
            text("SELECT id, user_id FROM join_request WHERE chapter_id = :chapter_id AND status = 'pending'"),
            {"chapter_id": admin.chapter_id}
        ).fetchall()

        print(f"DEBUG: Found {len(requests)} pending membership requests")

        return jsonify([
            {
                "id": r.id,
                "name": User.query.get(r.user_id).name if User.query.get(r.user_id) else "Unknown",
                "email": User.query.get(r.user_id).email if User.query.get(r.user_id) else "Unknown",
                "user_id": r.user_id
            }
            for r in requests
        ])
    except Exception as e:
        print(f"DEBUG: Error fetching requests - {str(e)}")
        return jsonify({"error": "Server error"}), 500

from flask_cors import cross_origin


@auth_routes.route("/membership_requests/<int:request_id>/update", methods=["POST", "OPTIONS"])  # ✅ Ensure OPTIONS is included
@jwt_required()
@cross_origin(origin="http://localhost:3000", supports_credentials=True)  # ✅ Fix CORS
def update_membership_request(request_id):
    if request.method == "OPTIONS":
        print(f"DEBUG: Received OPTIONS request for membership_requests/{request_id}/update")
        return jsonify({"message": "Preflight request successful"}), 200  # ✅ Allow preflight requests

    data = request.json
    action = data.get("action")

    user_id = get_jwt_identity()
    admin = User.query.get(user_id)

    if not admin or admin.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    request_entry = JoinRequest.query.get(request_id)
    if not request_entry:
        return jsonify({"error": "Request not found"}), 404

    user = User.query.get(request_entry.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if action == "approve":
        user.chapter_id = admin.chapter_id
        db.session.delete(request_entry)  # Remove request after approval
        db.session.commit()
        return jsonify({"message": f"{user.name} has been approved and added to the chapter."})

    elif action == "deny":
        db.session.delete(request_entry)
        db.session.commit()
        return jsonify({"message": f"{user.name} has been denied membership."})

    return jsonify({"error": "Invalid action"}), 400


@auth_routes.route("/chapter_members", methods=["GET", "OPTIONS"])
@jwt_required()
def get_chapter_members():
    if request.method == "OPTIONS":
        response = jsonify({"message": "Preflight request successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
        return response, 200

    user_id = int(get_jwt_identity())  # Get logged-in user's ID
    admin = User.query.get(user_id)

    if not admin or not admin.chapter_id:
        return jsonify({"error": "User is not associated with any chapter"}), 400

    # Fetch all members in the same chapter
    members = User.query.filter_by(chapter_id=admin.chapter_id).all()

    response = jsonify([
        {
            "id": member.id,
            "name": member.name,
            "email": member.email,
            "role": member.role
        }
        for member in members
    ])
    
    # ✅ Explicitly allow CORS
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")

    return response

    
@auth_routes.route("/assign_user_role", methods=["POST"])
@jwt_required()
def assign_user_role():
    data = request.json
    target_user_id = int(data.get("user_id"))  # ✅ Expecting user ID
    new_role = data.get("role")

    valid_roles = ["admin", "exec", "member"]  # ✅ Define allowed roles

    if new_role not in valid_roles:
        return jsonify({"error": "Invalid role"}), 400

    admin_id = int(get_jwt_identity())  # ✅ Ensure JWT identity is an integer
    admin = User.query.get(admin_id)

    if not admin or admin.role != "admin":
        return jsonify({"error": "Only admins can assign roles"}), 403

    # Find target user and check they belong to the same chapter
    user = User.query.get(target_user_id)
    if not user or user.chapter_id != admin.chapter_id:
        return jsonify({"error": "User not found or not in the same chapter"}), 404

    # Update user role
    user.role = new_role
    db.session.commit()

    return jsonify({"message": f"{user.name} is now assigned the role of {new_role}."})

@auth_routes.route("/chapter/hierarchy", methods=["GET"])
@jwt_required()
def get_chapter_hierarchy():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.chapter_id:
        return jsonify({"error": "User is not associated with any chapter"}), 400

    # Fetch all members in the chapter
    members = User.query.filter_by(chapter_id=user.chapter_id).all()

    # Sort members into roles
    admin = next((m for m in members if m.role == "admin"), None)
    execs = [m for m in members if m.role == "exec"]
    members = [m for m in members if m.role == "member"]

    # Convert to JSON format with a fallback for email
    chapter_data = {
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email if admin and admin.email else "No email provided",  
            "phone": getattr(admin, 'phone', "N/A"),
        } if admin else None,
        "execs": [
            {
                "id": exec.id,
                "name": exec.name,
                "email": exec.email if exec.email else "No email provided",  
                "phone": getattr(exec, 'phone', "N/A"),
            } for exec in execs
        ],
        "members": [
            {
                "id": member.id,
                "name": member.name,
                "email": member.email if member.email else "No email provided",  
                "phone": getattr(member, 'phone', "N/A"),
            } for member in members
        ]
    }

    print("DEBUG: Returning chapter hierarchy:", chapter_data)  
    return jsonify(chapter_data)

@auth_routes.route("/study_sessions", methods=["OPTIONS"])
def preflight_study_sessions():
    response = jsonify({"message": "Preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200


@auth_routes.route("/study_sessions", methods=["POST"])
@jwt_required()
def log_study_session():
    user_id = get_jwt_identity()
    data = request.json

    try:
        print("DEBUG - raw incoming study session payload:", data)
        start_time = datetime.fromisoformat(data["start_time"])
        end_time = datetime.fromisoformat(data["end_time"])
    except Exception as e:
        print("❌ DEBUG - datetime parsing failed:", str(e))
        return jsonify({"error": "Invalid datetime format"}), 400

    if end_time <= start_time:
        return jsonify({"error": "End time must be after start time"}), 400

    duration = (end_time - start_time).total_seconds() / 3600.0

    session = StudySession(
        user_id=user_id,
        start_time=start_time,
        end_time=end_time,
        description=data.get("description", ""),
        duration_hours=round(duration, 2)
    )

    db.session.add(session)
    db.session.commit()

    response = jsonify({
        "message": "Study session logged successfully",
        "duration_hours": round(duration, 2)
    })
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 201


@auth_routes.route("/study_summary", methods=["GET"])
@jwt_required()
def get_study_summary():
    user_id = get_jwt_identity()
    period = request.args.get("period", "week")

    now = datetime.now()

    if period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1)
        else:
            end = start.replace(month=start.month + 1)
    else:  
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=7)

    sessions = StudySession.query.filter(
        StudySession.user_id == user_id,
        StudySession.start_time >= start,
        StudySession.start_time < end
    ).all()

    total = sum(s.duration_hours for s in sessions)

    return jsonify({
        "total_hours": round(total, 2),
        "period": period,
        "sessions": [
            {
                "id": s.id,
                "start_time": s.start_time.isoformat(),
                "end_time": s.end_time.isoformat(),
                "duration": s.duration_hours,
                "description": s.description
            }
            for s in sessions
        ]
    })

@auth_routes.route("/service_sessions", methods=["OPTIONS"])
def preflight_service_sessions():
    response = jsonify({"message": "Preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200

@auth_routes.route("/service_sessions", methods=["POST"])
@jwt_required()
def log_service_session():
    data = request.json
    user_id = get_jwt_identity()

    try:
        date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        time = datetime.strptime(data["time"], "%H:%M").time()
        duration = float(data["duration_hours"])
    except Exception:
        return jsonify({"error": "Invalid input"}), 400

    new_entry = ServiceHour(
        user_id=user_id,
        date=date,
        time=time,
        duration_hours=duration,
        description=data["description"],
    )

    db.session.add(new_entry)
    db.session.commit()

    response = jsonify({"message": "Service hours submitted for approval"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 201


@auth_routes.route("/my_service_hours", methods=["GET"])
@jwt_required()
def get_my_service_hours():
    user_id = get_jwt_identity()
    entries = ServiceHour.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": e.id,
            "date": e.date.isoformat(),
            "time": e.time.strftime("%H:%M"),
            "duration_hours": e.duration_hours,
            "description": e.description,
            "verified": e.verified
        }
        for e in entries
    ])


@auth_routes.route("/pending_service_hours", methods=["GET"])
@jwt_required()
def get_pending_service_hours():
    user = User.query.get(get_jwt_identity())
    if user.role not in ["admin", "exec"]:
        return jsonify({"error": "Unauthorized"}), 403

    pending = ServiceHour.query.filter_by(verified=False).all()
    return jsonify([
        {
            "id": e.id,
            "user_name": e.user.name,
            "description": e.description,
            "date": e.date.isoformat(),
            "time": e.time.strftime("%H:%M"),
            "duration_hours": e.duration_hours
        }
        for e in pending
    ])

@auth_routes.route("/verify_service_hour/<int:id>", methods=["POST"])
@jwt_required()
def verify_service_hour(id):
    user = User.query.get(get_jwt_identity())
    if user.role not in ["admin", "exec"]:
        return jsonify({"error": "Unauthorized"}), 403

    entry = ServiceHour.query.get(id)
    if not entry:
        return jsonify({"error": "Entry not found"}), 404

    entry.verified = True
    db.session.commit()

    response = jsonify({"message": "Service hour verified"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200

@auth_routes.route("/service_summary", methods=["GET"])
@jwt_required()
def get_service_summary():
    user_id = get_jwt_identity()
    period = request.args.get("period", "week")

    now = datetime.utcnow()
    if period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:  # default to week
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)

    sessions = ServiceHour.query.filter(
        ServiceHour.user_id == user_id,
        ServiceHour.date >= start.date()
    ).all()

    return jsonify({
        "total_hours": round(sum(s.duration_hours for s in sessions), 2),
        "period": period,
        "sessions": [
            {
                "id": s.id,
                "start_time": f"{s.date.isoformat()}T{s.time.strftime('%H:%M:%S')}",
                "end_time": "",  # optional or placeholder
                "duration": s.duration_hours,
                "description": s.description,
                "verified": s.verified
            } for s in sessions
        ]
    })



