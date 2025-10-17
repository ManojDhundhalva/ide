import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCookie } from "../utils/cookies";

const ProtectedRoute = ({ Component }) => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const fetchUser = useAuthStore((s) => s.fetchUser);

    useEffect(() => {
        const authenticateUser = () => {
            if (!getCookie('SESSION-TOKEN')) navigate("/auth");
            else fetchUser();
        };

        authenticateUser();
    }, [navigate, fetchUser]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <>
            {!isOnline && <h2><b>You are offline</b></h2>}
            <div><Component /></div>
        </>
    )
}

export default ProtectedRoute