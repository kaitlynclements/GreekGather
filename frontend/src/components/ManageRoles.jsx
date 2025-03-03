import React, { useEffect, useState } from "react";
import "./ManageRoles.css";

const ManageRoles = () => {
    const [members, setMembers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:5000/auth/chapter_members", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Fetched members:", data);
            if (Array.isArray(data)) {
                setMembers(data);  // ✅ Ensure it's an array
            } else {
                setMembers([]);  // ✅ Prevent errors if response is invalid
            }
        })
        .catch(error => console.error("Error fetching members:", error));
    }, []);

    const assignRole = () => {
        if (!selectedUser || !newRole) return;

        fetch("http://127.0.0.1:5000/auth/assign_user_role", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                user_id: selectedUser,
                role: newRole
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            let updatedMembers = [];
            for (let i = 0; i < members.length; i++) {
                if (members[i].id === selectedUser) {
                    updatedMembers.push({ ...members[i], role: newRole });
                } else {
                    updatedMembers.push(members[i]);
                }
            }
            setMembers(updatedMembers);
        })
        .catch(error => console.error("Error updating role:", error));
    };

    return (
        <div>
            <h2>Manage Chapter Roles</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>New Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(members) && members.length > 0 ? (
                        (() => {
                            let rows = [];
                            for (let i = 0; i < members.length; i++) {
                                rows.push(
                                    <tr key={members[i].id}>
                                        <td>{members[i].name}</td>
                                        <td>{members[i].email}</td>
                                        <td>{members[i].role}</td>
                                        <td>
                                            <select onChange={e => setNewRole(e.target.value)} defaultValue="">
                                                <option value="" disabled>Select role</option>
                                                <option value="exec">Exec</option>
                                                <option value="member">Member</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button onClick={() => {
                                                setSelectedUser(members[i].id);
                                                assignRole();
                                            }}>
                                                Assign Role
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }
                            return rows;
                        })()
                    ) : (
                        <tr><td colSpan="5">No members found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ManageRoles;
