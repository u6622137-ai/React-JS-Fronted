import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const firstnameRef = useRef();
    const lastnameRef = useRef();
    const emailRef = useRef();
    const fileRef = useRef();

    async function loadUser() {
        try {
            const response = await fetch(`http://localhost:3000/api/user/${id}`);
            if (!response.ok) throw new Error("User not found");
            const data = await response.json();
            setUser(data);
            if (data.profileImage) {
                setPreview(`http://localhost:3000${data.profileImage}`);
            }
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleUpload() {
        const file = fileRef.current.files[0];
        if (!file) return null;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const response = await fetch("http://localhost:3000/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                return data.url;
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (err) {
            setMessage({ type: "error", text: err.message });
            return null;
        } finally {
            setUploading(false);
        }
    }

    async function onSave() {
        setMessage({ type: "", text: "" });

        let profileImageUrl = user.profileImage;
        const newFile = fileRef.current.files[0];

        if (newFile) {
            const uploadedUrl = await handleUpload();
            if (!uploadedUrl) return; // Error handled in handleUpload
            profileImageUrl = uploadedUrl;
        }

        const body = {
            firstname: firstnameRef.current.value,
            lastname: lastnameRef.current.value,
            email: emailRef.current.value,
            profileImage: profileImageUrl
        };

        try {
            const response = await fetch(`http://localhost:3000/api/user/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                loadUser();
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        }
    }

    useEffect(() => {
        loadUser();
    }, [id]);

    if (loading) return <div style={containerStyle}>Loading...</div>;
    if (!user) return <div style={containerStyle}>User not found.</div>;

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={titleStyle}>User Profile Management</h1>
                <button onClick={() => navigate("/users")} style={secondaryButtonStyle}>Back to Users</button>
            </header>

            {message.text && (
                <div style={{
                    ...messageStyle,
                    backgroundColor: message.type === "success" ? "#ecfdf5" : "#fff1f2",
                    color: message.type === "success" ? "#059669" : "#be123c",
                    borderColor: message.type === "success" ? "#10b981" : "#f43f5e"
                }}>
                    {message.text}
                </div>
            )}

            <div style={cardStyle}>
                <div style={profileSectionStyle}>
                    <div style={imageContainerStyle}>
                        <img
                            src={preview || "https://via.placeholder.com/150"}
                            alt="Profile"
                            style={profileImageStyle}
                        />
                        <div style={uploadOverlayStyle}>
                            <label htmlFor="file-upload" style={uploadLabelStyle}>
                                {uploading ? "Uploading..." : "Change Image"}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                ref={fileRef}
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    <div style={infoSectionStyle}>
                        <p style={idStyle}>User ID: {user._id}</p>
                        <h2 style={nameDisplayStyle}>{user.firstname} {user.lastname}</h2>
                        <p style={emailDisplayStyle}>{user.email}</p>
                    </div>
                </div>

                <div style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>First Name</label>
                        <input ref={firstnameRef} defaultValue={user.firstname} style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Last Name</label>
                        <input ref={lastnameRef} defaultValue={user.lastname} style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Email Address</label>
                        <input ref={emailRef} defaultValue={user.email} style={inputStyle} />
                    </div>

                    <div style={actionsStyle}>
                        <button onClick={onSave} disabled={uploading} style={primaryButtonStyle}>
                            {uploading ? "Processing..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const containerStyle = { padding: "40px", fontFamily: "'Inter', sans-serif", maxWidth: "800px", margin: "0 auto", color: "#1a1a1a" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const titleStyle = { fontSize: "2rem", fontWeight: "700", margin: 0 };
const cardStyle = { background: "white", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden", border: "1px solid #e5e7eb" };
const profileSectionStyle = { display: "flex", alignItems: "center", gap: "30px", padding: "40px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderBottom: "1px solid #e5e7eb" };
const imageContainerStyle = { position: "relative", width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "4px solid white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" };
const profileImageStyle = { width: "100%", height: "100%", objectFit: "cover" };
const uploadOverlayStyle = { position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "4px 0", textAlign: "center" };
const uploadLabelStyle = { color: "white", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", display: "block" };
const infoSectionStyle = { flex: 1 };
const idStyle = { fontSize: "0.85rem", color: "#64748b", margin: "0 0 8px 0", fontFamily: "monospace" };
const nameDisplayStyle = { fontSize: "1.75rem", fontWeight: "700", margin: "0 0 4px 0" };
const emailDisplayStyle = { fontSize: "1rem", color: "#4b5563", margin: 0 };
const formStyle = { padding: "40px", display: "grid", gap: "24px" };
const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontSize: "0.9rem", fontWeight: "600", color: "#374151" };
const inputStyle = { padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem", outline: "none" };
const actionsStyle = { marginTop: "12px", display: "flex", justifyContent: "flex-end" };
const primaryButtonStyle = { backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "1rem" };
const secondaryButtonStyle = { backgroundColor: "white", color: "#1f2937", border: "1px solid #e5e7eb", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.9rem" };
const messageStyle = { padding: "16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid", fontWeight: "500" };
