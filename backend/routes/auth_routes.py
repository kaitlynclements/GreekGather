# Handles user registration & login

from flask import Blueprint, request, jsonify
from database import db
from models import User, Chapter
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_routes = Blueprint("auth", __name__)


@auth_routes.route("/get_chapters", methods=["GET"])
def get_chapters():
    chapters = Chapter.query.all()
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


# ✅ User Registration
@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    new_user = User(name=name, email=email)
    new_user.set_password(password)  # Using the new set_password method

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})


# ✅ User Login
@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):  # Using the new check_password method
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "token": access_token,
            "role": user.role,
            "chapter_id": user.chapter_id
        })

    return jsonify({"error": "Invalid credentials"}), 401


# ✅ Create a New Chapter (Only Admins)
@auth_routes.route("/create_chapter", methods=["POST"])
@jwt_required()
def create_chapter():
    data = request.json
    organization_name = data.get("organization_name")
    chapter_name = data.get("chapter_name")
    user_id = get_jwt_identity()

    # Get user making the request
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Ensure the exact same chapter does not already exist
    if Chapter.query.filter_by(
        organization_name=organization_name, chapter_name=chapter_name
    ).first():
        return jsonify({"error": "Chapter already exists"}), 400

    # Assign user as chapter admin
    user.role = "admin"
    new_chapter = Chapter(
        organization_name=organization_name, chapter_name=chapter_name, admin_id=user.id
    )

    db.session.add(new_chapter)
    db.session.commit()

    return jsonify(
        {
            "message": f"Chapter {organization_name} - {chapter_name} created successfully",
            "chapter_id": new_chapter.id,
        }
    )


# ✅ Join an Existing Chapter
@auth_routes.route("/join_chapter", methods=["POST"])
@jwt_required()
def join_chapter():
    data = request.json
    organization_name = data.get("organization_name")
    chapter_name = data.get("chapter_name")
    user_id = get_jwt_identity()

    user = User.query.get(user_id)
    chapter = Chapter.query.filter_by(
        organization_name=organization_name, chapter_name=chapter_name
    ).first()

    if not user or not chapter:
        return jsonify({"error": "User or Chapter not found"}), 404

    user.chapter_id = chapter.id
    db.session.commit()

    return jsonify(
        {
            "message": f"{user.name} has joined {chapter.organization_name} - {chapter.chapter_name}"
        }
    )


# ✅ Assign a Role (Only Admins)
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

    if not Chapter.query.get(chapter_id):
        return jsonify({"error": "Chapter not found"}), 404

    # Check if a request already exists
    existing_request = JoinRequest.query.filter_by(
        user_id=user_id, chapter_id=chapter_id
    ).first()
    if existing_request:
        return (
            jsonify({"error": "You have already requested to join this chapter"}),
            400,
        )

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
