import React, { useState, useEffect, useCallback } from "react";
import { auth, googleProvider, db, storage } from "../services/firebase";
import { createUserWithEmailAndPassword, getRedirectResult, signInWithPopup } from "firebase/auth"; // ✅ Fixed missing import
import { setDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "athlete", // Default role
    });
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleUserRegistration = useCallback(async (user) => {
        let profilePicURL = user.photoURL || "";

        if (profilePic) {
            const storageRef = ref(storage, `profile_pictures/${user.uid}`);
            await uploadBytes(storageRef, profilePic);
            profilePicURL = await getDownloadURL(storageRef);
        }

        const role = formData.role || "athlete"; // Get role from formData

        const userData = {
            name: user.displayName || formData.name,
            email: user.email,
            role,
            profilePic: profilePicURL,
            experience: role === "coach" ? "" : null,
            teamsManaged: role === "coach" ? [] : null,
            matchesPlayed: role === "athlete" ? 0 : null,
            goalsScored: role === "athlete" ? 0 : null,
            assists: role === "athlete" ? 0 : null,
            achievements: [],
            socialLinks: {},
        };

        try {
            await setDoc(doc(db, "users", user.uid), userData);
            console.log("User registered successfully:", role);

            // ✅ Ensure navigation happens only after Firestore writes
            setTimeout(() => {
                navigate(role === "coach" ? "/CoachDashboard" : "/AthleteDashboard");
            }, 500); // Slight delay to allow Firebase writes
        } catch (error) {
            console.error("Error saving user:", error);
            setError("Failed to save user data. Please try again.");
        }
    }, [formData, navigate, profilePic]); // ✅ Added necessary dependencies

    useEffect(() => {
        const checkRedirectResult = async () => {
            const result = await getRedirectResult(auth);
            if (result?.user) {
                await handleUserRegistration(result.user);
            }
        };

        checkRedirectResult();
    }, [handleUserRegistration]); // ✅ Fixed missing dependency warning

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (authMethod, user = null) => {
        setLoading(true);
        setError("");

        try {
            let userCredential = user ? { user } : await authMethod;
            user = userCredential.user;
            await handleUserRegistration(user);
        } catch (error) {
            console.error("Signup Error:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await signInWithPopup(auth, googleProvider); // ✅ Fixed missing import
            const user = result.user;

            // Fetch role from Firestore (if user exists)
            const userDoc = await getDoc(doc(db, "users", user.uid));
            let role = userDoc.exists() ? userDoc.data().role : "athlete"; // Default to athlete

            await handleUserRegistration(user); // Register user in Firestore if new
            navigate(role === "coach" ? "/CoachDashboard" : "/AthleteDashboard");
        } catch (error) {
            console.error("Google Sign-In Error:", error.message);

            if (error.code === "auth/popup-closed-by-user") {
                setError("You closed the sign-in popup. Please try again.");
            } else if (error.message.includes("network-request-failed")) {
                setError("Network error. Check your connection and try again.");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Create an Account</h2>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSignup(createUserWithEmailAndPassword(auth, formData.email, formData.password));
                }} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full p-2 border rounded-lg"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full p-2 border rounded-lg"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full p-2 border rounded-lg"
                        required
                    />
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full p-2 border rounded-lg"
                    >
                        <option value="athlete">Athlete</option>
                        <option value="coach">Coach</option>
                    </select>
                    <input
                        type="file"
                        onChange={(e) => setProfilePic(e.target.files[0])}
                        className="block w-full p-2 border rounded-lg"
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg" disabled={loading}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>

                <button
                    onClick={handleGoogleSignIn}
                    className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg"
                    disabled={loading}
                >
                    {loading ? "Signing Up..." : "Sign up with Google"}
                </button>

                <p className="text-center mt-4">
                    Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;