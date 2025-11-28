import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoadingComponent from "./Loading";

import { Box } from "@mui/material";
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';

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
            {!isOnline && (
                <Box
                    sx={{
                    position: "fixed",
                    top: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "rgba(242, 57, 57, 0.95)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    zIndex: 9999,
                    fontFamily: "Quicksand, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    animation: "slideDown 0.3s ease-out"
                    }}
                >
                    <WifiOffRoundedIcon sx={{ fontSize: "20px" }} />
                    You are offline
                </Box>
            )}
            {user.userId ? <div><Component /></div> : <LoadingComponent />}
        </>
    )
}

export default ProtectedRoute