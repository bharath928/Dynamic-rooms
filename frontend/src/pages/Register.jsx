import React, { useState } from "react";
import './Register.css';
import { Navigate, useNavigate } from "react-router-dom";
const Register = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); 
    const [message, setMessage] = useState("");
    const navigate=useNavigate();
    
    const handleRegister = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ userId, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("User registered successfully!");
                setTimeout(()=> navigate("/"),1000);
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setMessage("Something went wrong!");
            console.error("Error:", error);
        }
    };
const back=()=>{
    navigate('/');
};
    return (
        <div className="register-container">
            <button className="back-btn" onClick={back}> Back</button>
            <form onSubmit={handleRegister} className="register-box">
                <h2>Register User</h2>
                
                <input 
                    type="text" 
                    placeholder="User ID" 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)} 
                    required 
                />

                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />

                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    {/* <option value="user">User</option> */}
                    <option value="admin">Admin</option>
                </select>

                <button type="submit">Register</button>

                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default Register;



