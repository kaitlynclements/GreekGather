import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    graduation_year: '',
    major: '',
    bio: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/auth/profile', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => console.error('Profile load error:', err));
  }, [token]);

  const handleChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const updateField = field => {
    if (!user[field]) return alert(`Please enter a ${field}`);
    
    fetch('http://127.0.0.1:5000/auth/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [field]: user[field] }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
      })
      .then(data => {
        alert(`${field[0].toUpperCase() + field.slice(1)} updated!`);
        setUser(data.user);
      })
      .catch(err => {
        console.error(err);
        alert(`Failed to update ${field}`);
      });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://127.0.0.1:5000/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to change password');
        }

        const { message } = await response.json();
        setMessage(message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error) {
        console.error('Password change error:', error);
        setError(error.message || 'Failed to change password');
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-current-info">
        <h3>Current Information</h3>
        <p><strong>Name:</strong> {user.name || 'Not set'}</p>
        <p><strong>Email:</strong> {user.email || 'Not set'}</p>
        <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
        <p><strong>Graduation Year:</strong> {user.graduation_year || 'Not set'}</p>
        <p><strong>Major:</strong> {user.major || 'Not set'}</p>
        <p><strong>Bio:</strong> {user.bio || 'Not set'}</p>
      </div>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Name</label>
        <input name="name" value={user.name} onChange={handleChange} />
        <button type="button" onClick={() => updateField('name')}>Update Name</button>
      </form>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Email</label>
        <input name="email" value={user.email} onChange={handleChange} />
        <button type="button" onClick={() => updateField('email')}>Update Email</button>
      </form>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Phone</label>
        <input name="phone" value={user.phone || ''} onChange={handleChange} />
        <button type="button" onClick={() => updateField('phone')}>Update Phone</button>
      </form>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Graduation Year</label>
        <input name="graduation_year" value={user.graduation_year || ''} onChange={handleChange} />
        <button type="button" onClick={() => updateField('graduation_year')}>Update Graduation Year</button>
      </form>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Major</label>
        <input name="major" value={user.major || ''} onChange={handleChange} />
        <button type="button" onClick={() => updateField('major')}>Update Major</button>
      </form>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Bio</label>
        <textarea name="bio" value={user.bio || ''} onChange={handleChange} />
        <button type="button" onClick={() => updateField('bio')}>Update Bio</button>
      </form>

      <hr className="profile-divider" />

      <div className="profile-section">
        <label>Current Password</label>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div className="profile-section">
        <label>New Password</label>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="profile-section">
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={handlePasswordChange}
        disabled={!currentPassword || !newPassword || !confirmPassword}
      >
        Change Password
      </button>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Profile;
