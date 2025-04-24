'''
 * Name: announcements.py
 * Description: Component for helping displaying and edit announcements in GreekGather.
 * Programmer's Names: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: April 24th, 2025
 * Revised: Refer to Github Commits
 * Preconditions: Announcements data must be available via the backend.
 * Acceptable Inputs: None (fetches announcements).
 * Unacceptable Inputs: None.
 * Postconditions: Displays a list of announcements.
 * Invariants: Announcements must be kept up-to-date.
 * Known Faults: N/A.
'''

from flask import Blueprint, request, jsonify
from models import db, Announcement, User
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity

announcements = Blueprint('announcements', __name__)

def exec_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        user = User.query.get(current_user_id)
        if not user or user.role not in ['admin', 'exec']:
            return jsonify({'error': 'Unauthorized - Executive access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@announcements.route('/api/announcements', methods=['GET'])
@jwt_required()
def get_announcements():
    """Get all announcements for the user's chapter"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.chapter_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    announcements = Announcement.query.filter_by(chapter_id=user.chapter_id)\
        .order_by(Announcement.created_at.desc())\
        .all()
    
    return jsonify([announcement.to_dict() for announcement in announcements])

@announcements.route('/api/announcements', methods=['POST'])
@jwt_required()
@exec_required
def create_announcement():
    """Create a new announcement"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    data = request.get_json()
    
    if not all(k in data for k in ['title', 'message']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    announcement = Announcement(
        title=data['title'],
        message=data['message'],
        author_id=current_user_id,
        chapter_id=user.chapter_id
    )
    
    db.session.add(announcement)
    db.session.commit()
    
    return jsonify(announcement.to_dict()), 201

@announcements.route('/api/announcements/<int:announcement_id>', methods=['PUT'])
@jwt_required()
@exec_required
def update_announcement(announcement_id):
    """Update an existing announcement"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    announcement = Announcement.query.get_or_404(announcement_id)
    
    # Allow any exec or admin to edit any announcement
    if user.role not in ['admin', 'exec']:
        return jsonify({'error': 'Unauthorized - Executive access required'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        announcement.title = data['title']
    if 'message' in data:
        announcement.message = data['message']
    
    db.session.commit()
    return jsonify(announcement.to_dict())

@announcements.route('/api/announcements/<int:announcement_id>', methods=['DELETE'])
@jwt_required()
@exec_required
def delete_announcement(announcement_id):
    """Delete an announcement"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    announcement = Announcement.query.get_or_404(announcement_id)
    
    if announcement.author_id != current_user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized - Only the author or admin can delete'}), 403
    
    db.session.delete(announcement)
    db.session.commit()
    
    return '', 204 