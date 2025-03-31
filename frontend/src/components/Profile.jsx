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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error('Password update failed');
      alert('Password updated!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      alert('Failed to change password');
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
        <label>New Password</label>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {password && confirmPassword && password !== confirmPassword && (
          <p style={{ color: 'red', fontSize: '0.9rem' }}>Passwords do not match</p>
        )}

        <button
          type="button"
          onClick={handlePasswordChange}
          disabled={!password || password !== confirmPassword}
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
