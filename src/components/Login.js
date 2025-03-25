import React, { useState } from "react";
import { auth, googleProvider, db } from "../services/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const fetchUserRole = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                localStorage.setItem("userRole", userData.role || "athlete");

                return userData.role || "athlete";
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
        return "athlete"; // Default role if not found
    };

    const handleLogin = async (authMethod) => {
        try {
            const userCredential = await authMethod;
            const user = userCredential.user;

            const role = await fetchUserRole(user.uid);
            console.log("User logged in with role:", role);

            // Redirect based on role
            navigate(role === "coach" ? "/CoachDashboard" : "/AthleteDashboard");
        } catch (error) {
            console.error("Error logging in:", error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Login</h2>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin(signInWithEmailAndPassword(auth, email, password));
                }} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full p-2 border rounded-lg"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full p-2 border rounded-lg"
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Login</button>
                </form>

                <button
                    onClick={() => handleLogin(signInWithPopup(auth, googleProvider))}
                    className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg"
                >
                    Sign in with Google
                </button>

                <p className="text-center mt-4">
                    Don't have an account? <Link to="/signup" className="text-blue-600">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;