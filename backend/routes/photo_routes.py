# photo_routes.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Photo, db
from datetime import datetime
import os
from werkzeug.utils import secure_filename

photo_routes = Blueprint("photo_routes", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "static", "uploads")

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@photo_routes.route("/media/photos", methods=["GET"])
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

@photo_routes.route("/media/upload", methods=["POST"])
@jwt_required()
def upload_photo():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.chapter_id:
        return jsonify({"error": "User not found or not part of a chapter"}), 403

    if "photo" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["photo"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Construct URL for the frontend (assuming Flask serves static files)
    image_url = f"http://127.0.0.1:5000/static/uploads/{filename}"

    new_photo = Photo(
        uploader_id=user.id,
        chapter_id=user.chapter_id,
        image_url=image_url,
        caption=f"Uploaded by {user.name}",
        upload_date=datetime.utcnow()
    )

    db.session.add(new_photo)
    db.session.commit()

    return jsonify({"message": "Photo uploaded successfully"}), 201
