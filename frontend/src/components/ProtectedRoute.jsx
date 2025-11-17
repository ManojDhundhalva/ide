import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ Component }) => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const fetchUser = useAuthStore((s) => s.fetchUser);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        const authenticateUser = () => {
            const sessionToken = window.localStorage.getItem("session-token");
            if (!sessionToken) navigate("/auth");
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
            {user.userId ? <div><Component /></div> : <h1>Loading...</h1>}
        </>
    )
}

export default ProtectedRoute