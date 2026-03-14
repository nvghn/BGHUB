import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login, register, loading, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isRegisterMode) {
            // Register
            const result = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.phone
            );
            
            if (result.success) {
                navigate("/");
            }
        } else {
            // Login
            const result = await login(formData.email, formData.password);
            
            if (result.success) {
                navigate("/");
            }
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
            <h2>{isRegisterMode ? "Register" : "Login"}</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                
                {isRegisterMode && (
                    <>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                        />
                        <br />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                        />
                        <br />
                    </>
                )}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <br />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <br />

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: "100%", padding: "10px", cursor: "pointer" }}
                >
                    {loading ? "Processing..." : isRegisterMode ? "Register" : "Login"}
                </button>
            </form>

            <br />

            <button 
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                style={{ width: "100%", padding: "10px" }}
            >
                {isRegisterMode ? "Already have an account? Login" : "Don't have an account? Register"}
            </button>
        </div>
    );
};

export default Login;
