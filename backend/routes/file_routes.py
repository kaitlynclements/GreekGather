# file_routes.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, File, db
from datetime import datetime
import os
from werkzeug.utils import secure_filename

file_routes = Blueprint("file_routes", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "static", "files")

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- Get all uploaded files ---
@file_routes.route("/media/files", methods=["GET"])
@jwt_required()
def get_files():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.chapter_id:
        return jsonify({"error": "User not found or not part of a chapter"}), 403

    # Fetch files from the database instead of disk
    files = (
        File.query.filter_by(chapter_id=user.chapter_id)
        .order_by(File.upload_date.desc())
        .all()
    )

    response = [
        {
            "id": file.id,
            "name": file.filename,
            "url": file.file_url,
            "uploaderName": file.uploader.name,
            "uploadedAt": file.upload_date.isoformat(),
        }
        for file in files
    ]

    return jsonify(response), 200

# --- Upload a new file ---
@file_routes.route("/media/files/upload", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.chapter_id:
        return jsonify({"error": "User not found or not part of a chapter"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Construct URL for frontend (assuming Flask is serving static files)
    file_url = f"http://127.0.0.1:5000/static/files/{filename}"

    # Save file record to database
    new_file = File(
        uploader_id=user.id,
        chapter_id=user.chapter_id,
        filename=filename,
        file_url=file_url,
        upload_date=datetime.utcnow()
    )

    db.session.add(new_file)
    db.session.commit()

    return jsonify({"message": "File uploaded successfully"}), 201
