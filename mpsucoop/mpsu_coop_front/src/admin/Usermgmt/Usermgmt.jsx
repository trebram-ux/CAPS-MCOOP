import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Usermgmt.css";

const AdminMemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [editMode, setEditMode] = useState(null); // Track the member being edited
  const [createMode, setCreateMode] = useState(null); // Track the member being created
  const [formData, setFormData] = useState({
    password: "", // Only password is needed for new member creation
    currentPassword: "", // For admin password reset condition
  });

  // Fetch all members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    axios
      .get(`http://localhost:8000/members/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log("Fetched members:", response.data);
        setMembers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching members:", error);
      });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreatePassword = (e, memberId) => {
    e.preventDefault();
  
    if (!memberId) {
      console.error("Member ID is undefined. Cannot set password.");
      return;
    }
  
    console.log("Creating password for member:", memberId, formData);
  
    axios
      .post(`http://localhost:8000/members/${memberId}/set_password/`, { password: formData.password }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log("Password set successfully:", response.data);
        setCreateMode(null); // Exit create mode
        setFormData({ password: "" });
      })
      .catch((error) => {
        console.error("Error setting password:", error);
      });
  };
  

  // Handle member editing, including password reset
  const handleEditSubmit = (e, memberId) => {
    e.preventDefault();
    console.log("Editing member details:", memberId, formData);

    // If the admin is resetting the password, ensure the current password is provided
    if (formData.password && !formData.currentPassword) {
      alert("Please enter the current password to reset.");
      return;
    }

    axios
      .put(`http://localhost:8000/members/${memberId}/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        setMembers(
          members.map((member) => (member.id === memberId ? response.data : member))
        );
        setEditMode(null); // Exit edit mode
        setFormData({ password: "", currentPassword: "" });
      })
      .catch((error) => {
        console.error("Error updating member:", error);
      });
  };

  // Handle member deletion
  const handleDelete = (memberId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this member and their user account?"
      )
    ) {
      axios
        .delete(`http://localhost:8000/members/${memberId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then(() => {
          setMembers(members.filter((member) => member.id !== memberId));
        })
        .catch((error) => {
          console.error("Error deleting member:", error);
        });
    }
  };

  return (
    <div className="member-management-container">
      <h2
        style={{
          marginTop: "-10px",
          padding: "20px",
          textAlign: "center",
          color: "black",
          fontSize: "30px",
        }}
      >
        User Management
      </h2>
      <div className="table-container">
        <table className="member-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Account Number</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const fullName = `${member.first_name} ${
                member.middle_name ? member.middle_name + " " : ""
              }${member.last_name}`;

              return (
                <tr key={member.id}>
                  <td>{fullName}</td>
                  <td>{member.user ? member.user.username : "N/A"}</td>
                  <td>{member.email || "N/A"}</td>
                  <td>
                  <button onClick={() => setCreateMode(member.id)}>Set Password</button>
                    <button onClick={() => setEditMode(member.id)}>Edit</button>
                    <button onClick={() => handleDelete(member.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editMode !== null && (
        <div className="edit-member-form">
          <h3>Edit Member</h3>
          <form onSubmit={(e) => handleEditSubmit(e, editMode)}>
            <div>
              <label>Current Password (for reset):</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password to reset (optional)"
              />
            </div>
            <div>
              <label>New Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password (leave blank if not changing)"
              />
            </div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditMode(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
      {createMode !== null && (
        <div className="create-password-form">
          <h3>Set Password for Member</h3>
          <form onSubmit={(e) => handleCreatePassword(e, createMode)}>
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit">Set Password</button>
            <button type="button" onClick={() => setCreateMode(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminMemberManagement;
