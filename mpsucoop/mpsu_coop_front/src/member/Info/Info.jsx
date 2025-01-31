import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../Topbar/Topbar';
import axios from 'axios';

const Home = () => {
  const [memberData, setMemberData] = useState(null);
  const [updatedMemberData, setUpdatedMemberData] = useState({});
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false); // State for showing the password reset modal
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // List of fields that are editable
  const editableFields = ['first_name', 'middle_name', 'last_name', 'email', 'address'];

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('No authentication token found. Please log in again.');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/member/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMemberData(response.data);
        setUpdatedMemberData(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch data.');
      }
    };

    fetchMemberDetails();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedProfile(file);
      setProfilePreview(URL.createObjectURL(file));

      try {
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('profile_picture', file);

        const response = await axios.post('http://localhost:8000/api/member/upload-profile-picture/', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });

        setMemberData((prevData) => ({
          ...prevData,
          profile_picture: response.data.profile_picture,
        }));
        alert('Profile picture updated successfully!');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to upload profile picture.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editableFields.includes(name)) {
      setUpdatedMemberData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      await axios.put(
        'http://localhost:8000/api/member/profile/',
        updatedMemberData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMemberData(updatedMemberData);
      alert('Changes saved successfully!');
      setIsEditMode(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save changes.');
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.put(
        'http://localhost:8000/api/member/reset-password/',
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Password updated successfully!');
      setShowPasswordReset(false); // Close the modal
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password.');
    }
  };

  const handleResetPassword = () => {
    setShowPasswordReset(true); // Show the reset password modal
  };

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p>{error}</p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!memberData) return <p>Loading...</p>;

  return (
    <div>
      <Topbar />
      <div
        style={{
          height: '100%',
          width: '100%',
          fontFamily: 'Arial, sans-serif',
          color: 'black',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '60px',
            marginTop: '60px',
            justifyContent: 'center',
          }}
        >
          {/* Left Card */}
          <div
            style={{
              borderRadius: '8px',
              width: '500px',
              padding: '20px',
              height: '200px',
              boxShadow: '0px 4px 20px rgba(187, 186, 186, 0.99)',
              marginTop: '150px',
            }}
          >
            <h3
              style={{
                fontWeight: 'bold',
                color: 'black',
                borderBottom: '2px solid rgb(133, 133, 132)',
                paddingBottom: '10px',
                textAlign: 'center',
                fontSize: '30px',
                color: 'green'
              }}
            >
              {memberData.first_name?.toUpperCase()} {memberData.middle_name?.toUpperCase()} {memberData.last_name?.toUpperCase()}
            </h3>
            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '30px' }}>
              ACCOUNT NUMBER: <span style={{ fontSize: '28px', fontWeight: '900', color: 'green'}}>{memberData.accountN || 'N/A'}</span>
            </p>
            {profilePreview && (
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '18px' }}>
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  style={{
                    height: '300px',
                    width: '55%',
                    borderRadius: '8px',
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Card */}
          <div
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              width: '600px',
              padding: '20px',
              boxShadow: '0px 4px 20px rgba(187, 186, 186, 0.99)',
              height: '480px',
              marginTop: '5px',
            }}
          >
            <h3 style={{ textAlign: 'center', color: 'black', fontSize: '30px', marginTop: '-10px' }}>
              {isEditMode ? 'Edit Information' : 'Member Information'}
            </h3>
            <div style={{ marginTop: '20px' }}>
              {/* Render only specific fields in pairs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['first_name', 'middle_name', 'last_name', 'email', 'phone_number', 'address', 'gender', 'age', 'birth_date', 'pstatus'].map((key) => (
                  <div
                    key={key}
                    style={{
                      flex: '1 1 calc(50% - 20px)',
                      marginBottom: '10px',
                    }}
                  >
                    <label>
                      {key.replace('_', ' ').toUpperCase()}:
                      <input
                        type="text"
                        name={key}
                        value={updatedMemberData[key] || ''}
                        readOnly={!isEditMode || !editableFields.includes(key)}  // Only make editable if it's in the list and edit mode is enabled
                        onChange={handleInputChange}
                        style={{
                          display: 'block',
                          width: '100%',
                          backgroundColor: isEditMode && editableFields.includes(key) ? '#fff' : '#e9ecef',
                          border: isEditMode && editableFields.includes(key) ? '1px solid #ced4da' : 'none',
                          padding: '8px',
                          borderRadius: '4px',
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>

              {isEditMode ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={handleSaveChanges}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '18px',
                      marginRight: '10px',
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setUpdatedMemberData(memberData);
                      setIsEditMode(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '18px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={() => setIsEditMode(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '18px',
                    }}
                  >
                    Edit Information
                  </button>
                  <button
                    onClick={handleResetPassword}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '18px',
                      marginLeft: '10px',
                    }}
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showPasswordReset && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}>
            <h3>Reset Password</h3>
            <label>
              Current Password:
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                }}
              />
            </label>
            <label>
              New Password:
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                }}
              />
            </label>
            <label>
              Confirm New Password:
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                }}
              />
            </label>
            <div style={{
              textAlign: 'center',
            }}>
              <button
                onClick={handleResetPasswordSubmit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '18px',
                  marginRight: '10px',
                }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowPasswordReset(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '18px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
