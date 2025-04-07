# chapter_routes.py

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Chapter  # , Photo
from datetime import datetime

chapter_routes = Blueprint("chapter_routes", __name__)


@chapter_routes.route("/chapter/hierarchy", methods=["GET"])
@jwt_required()
def get_chapter_hierarchy():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)

    if not current_user or not current_user.chapter_id:
        return (
            jsonify({"error": "User not found or not associated with a chapter"}),
            404,
        )

    # Get all users in the same chapter
    chapter_members = User.query.filter_by(chapter_id=current_user.chapter_id).all()

    # Organize members by role
    hierarchy = {"admin": None, "execs": [], "members": []}

    for member in chapter_members:
        member_data = {"id": member.id, "name": member.name, "role": member.role}

        if member.role == "admin":
            hierarchy["admin"] = member_data
        elif member.role == "exec":
            hierarchy["execs"].append(member_data)
        else:
            hierarchy["members"].append(member_data)

    return jsonify(hierarchy)


""" 
# Photo Gallery Routes



@chapter_routes.route("/media/photos", methods=["GET"])
@jwt_required()
def get_chapter_photos():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.chapter_id:
        return jsonify({"error": "User not found or not part of a chapter"}), 403

    photos = (
        Photo.query.filter_by(chapter_id=user.chapter_id)
        .order_by(Photo.upload_date.desc())
        .all()
    )

    response = [
        {
            "id": photo.id,
            "url": photo.image_url,
            "caption": photo.caption,
            "uploader_name": photo.uploader.name,
            "upload_date": photo.upload_date.strftime("%B %d, %Y"),
        }
        for photo in photos
    ]

    return jsonify(response), 200
"""
