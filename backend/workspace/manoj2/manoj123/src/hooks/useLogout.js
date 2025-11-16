import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const navigate = useNavigate();
    
    const logOut = useAuthStore((s) => s.logOut);

    const logoutAndRedirect = async () => {
        await logOut();
        if (!useAuthStore.getState().isAuthenticated) navigate("/auth");
    };

    return logoutAndRedirect;
};
