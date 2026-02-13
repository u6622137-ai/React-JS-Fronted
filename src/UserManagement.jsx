import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function UserManagement() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [editingUser, setEditingUser] = useState(null);

    // Add User Refs
    const usernameRef = useRef();
    const emailRef = useRef();
    const firstnameRef = useRef();
    const lastnameRef = useRef();

    // Edit User Refs
    const editUsernameRef = useRef();
    const editEmailRef = useRef();
    const editFirstnameRef = useRef();
    const editLastnameRef = useRef();
    const editStatusRef = useRef();

    async function loadUsers() {
        try {
            const response = await fetch(`http://localhost:3000/api/user?page=${page}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error("Loading failed", err);
            setUsers([]);
        }
    }

    async function onDelete(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await fetch(`http://localhost:3000/api/user/${id}`, { method: "DELETE" });
            loadUsers();
        } catch (err) {
            alert("Delete failed");
        }
    }

    async function onUserSave() {
        const body = {
            username: usernameRef.current.value,
            email: emailRef.current.value,
            firstname: firstnameRef.current.value,
            lastname: lastnameRef.current.value,
            status: "ACTIVE"
        };

        if (!body.username || !body.email || !body.firstname || !body.lastname) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                usernameRef.current.value = "";
                emailRef.current.value = "";
                firstnameRef.current.value = "";
                lastnameRef.current.value = "";
                loadUsers();
            }
        } catch (err) {
            alert("Save failed");
        }
    }

    async function onUpdateUser() {
        const body = {
            username: editUsernameRef.current.value,
            email: editEmailRef.current.value,
            firstname: editFirstnameRef.current.value,
            lastname: editLastnameRef.current.value,
            status: editStatusRef.current.value
        };

        try {
            const response = await fetch(`http://localhost:3000/api/user/${editingUser._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                setEditingUser(null);
                loadUsers();
            }
        } catch (err) {
            alert("Update failed");
        }
    }

    useEffect(() => { loadUsers(); }, [page]);

    return (
        <div style={{
            padding: "40px",
            fontFamily: "'Inter', sans-serif",
            maxWidth: "1200px",
            margin: "0 auto",
            color: "#1a1a1a"
        }}>
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px"
            }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>User Management</h1>
                <a href="/" style={secondaryButtonStyle}>Back to Items</a>
            </header>

            {/* Add User Section */}
            <div style={{
                background: "#f9fafb",
                padding: "24px",
                borderRadius: "12px",
                marginBottom: "40px",
                border: "1px solid #f3f4f6"
            }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Add New User</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                    <div>
                        <label style={labelStyle}>Username</label>
                        <input ref={usernameRef} placeholder="johndoe" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>First Name</label>
                        <input ref={firstnameRef} placeholder="John" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Last Name</label>
                        <input ref={lastnameRef} placeholder="Doe" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input ref={emailRef} placeholder="john@example.com" style={inputStyle} />
                    </div>
                    <button onClick={onUserSave} style={primaryButtonStyle}>Create</button>
                </div>
            </div>

            {/* Database Warning */}
            {users.length === 0 && (
                <div style={{
                    padding: "20px",
                    textAlign: "center",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "12px",
                    color: "#92400e",
                    marginBottom: "20px"
                }}>
                    <strong>Note:</strong> No users found. Please check your database connection or add a user above.
                </div>
            )}

            {/* Users Table */}
            <div style={{ overflowX: "auto", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "12px", background: "white" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Avatar</th>
                            <th style={thStyle}>Username</th>
                            <th style={thStyle}>Full Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={tdStyle}>
                                    <img
                                        src={user.profileImage ? `http://localhost:3000${user.profileImage}` : "https://via.placeholder.com/40"}
                                        alt=""
                                        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0" }}
                                    />
                                </td>
                                <td style={tdStyle}>{user.username}</td>
                                <td style={tdStyle}>{user.firstname} {user.lastname}</td>
                                <td style={tdStyle}>{user.email}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        backgroundColor: user.status === "ACTIVE" ? "#ecfdf5" : "#fff1f2",
                                        color: user.status === "ACTIVE" ? "#059669" : "#be123c",
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "0.75rem",
                                        fontWeight: "600"
                                    }}>
                                        {user.status || "ACTIVE"}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <Link to={`/profile/${user._id}`} style={{ color: "#059669", textDecoration: "none", fontWeight: "600" }}>Profile</Link>
                                        <button onClick={() => setEditingUser(user)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Edit</button>
                                        <button onClick={() => onDelete(user._id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={secondaryButtonStyle}>Prev</button>
                <div style={{ fontWeight: "600" }}>Page {page}</div>
                <button onClick={() => setPage(p => p + 1)} style={secondaryButtonStyle}>Next</button>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ marginTop: 0, marginBottom: "24px" }}>Edit User</h2>
                        <div style={{ display: "grid", gap: "16px" }}>
                            <div>
                                <label style={labelStyle}>Username</label>
                                <input ref={editUsernameRef} defaultValue={editingUser.username} style={inputStyle} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={labelStyle}>First Name</label>
                                    <input ref={editFirstnameRef} defaultValue={editingUser.firstname} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name</label>
                                    <input ref={editLastnameRef} defaultValue={editingUser.lastname} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input ref={editEmailRef} defaultValue={editingUser.email} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select ref={editStatusRef} defaultValue={editingUser.status || "ACTIVE"} style={inputStyle}>
                                    <option>ACTIVE</option>
                                    <option>INACTIVE</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                                <button onClick={() => setEditingUser(null)} style={secondaryButtonStyle}>Cancel</button>
                                <button onClick={onUpdateUser} style={primaryButtonStyle}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", width: "100%", fontSize: "0.95rem" };
const labelStyle = { display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "#4b5563", fontWeight: "500" };
const thStyle = { padding: "16px 24px", fontSize: "0.8rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" };
const tdStyle = { padding: "16px 24px" };
const primaryButtonStyle = { backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };
const secondaryButtonStyle = { backgroundColor: "white", color: "#1f2937", border: "1px solid #e5e7eb", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", textDecoration: "none" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modalContentStyle = { backgroundColor: "white", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "500px" };
