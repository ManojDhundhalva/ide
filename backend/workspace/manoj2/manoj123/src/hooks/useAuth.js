import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
    const navigate = useNavigate();
    
    const authentication = useAuthStore((s) => s.authentication);

    const responseGoogle = async (tokenResponse) => {
        await authentication(tokenResponse);
        if(!useAuthStore.getState().authenticationError) navigate("/");
    };

    return responseGoogle;
};