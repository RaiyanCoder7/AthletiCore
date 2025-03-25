import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthCheck = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const role = userDoc.data().role;
                        if (role === "coach") {
                            navigate("/CoachDashboard");
                        } else if (role === "athlete") {
                            navigate("/AthleteDashboard");
                        } else {
                            console.error("Unknown role:", role);
                            navigate("/login"); // Redirect to login if role is not recognized
                        }
                    } else {
                        console.error("User document not found in Firestore.");
                        navigate("/login");
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    navigate("/login");
                }
            } else {
                navigate("/login");
            }
            setLoading(false);
        };

        checkUserRole();
    }, [navigate]);

    if (loading) return <p>Loading...</p>;
    return null;
};

export default AuthCheck;