import { create } from "zustand";
import { api } from "../config/api";

export const useAuthStore = create((set) => ({
    user: {
        userId: null,
        email: null,
        name: null,
        image: null,
    },
    isAuthenticated: false,
        
    authenticationLoading: false,
    authenticationError: null,

    logOutLoading: false,
    logOutError: null,

    fetchUserLoading: false,
    fetchUserError: null,

    authentication: async (authResult) => {
        try {
            set({ authenticationLoading: true, authenticationError: null });

            if (!authResult || !authResult?.code) {
                throw new Error("Google auth error: code missing");
            }

            const { data } = await api.post("/auth", { code: authResult.code });

            set({
                user: {
                    userId: data?.user?._id,
                    email: data?.user?.email,
                    name: data?.user?.name,
                    image: data?.user?.image,
                },
                isAuthenticated: true,
            });

            window.localStorage.setItem("session-token", data.sessionToken);

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Authentication failed";
            set({ authenticationError: errorMsg });
            console.error("Authentication Error:", errorMsg);
        } finally {
            set({ authenticationLoading: false });
        }
    },

    logOut: async () => {
        try {
            set({ logOutLoading: true, logOutError: null });
            
            await api.post("/logout");

            set({
                user: {
                    userId: null,
                    email: null,
                    name: null,
                    image: null,
                },
                isAuthenticated: false,
            });

            window.localStorage.removeItem("session-token");

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Logout failed";
            set({ logOutError: errorMsg });
            console.error("Logout Error:", errorMsg);
        } finally {
            set({ logOutLoading: false });
        }
    },
    
    fetchUser: async () => {
        try {
            set({ fetchUserLoading: true, fetchUserError: null });

            const { data } = await api.get("/user");

            set({
                user: {
                    userId: data?.user?._id,
                    email: data?.user?.email,
                    name: data?.user?.name,
                    image: data?.user?.image,
                },
            });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Fetch user failed";
            set({ fetchUserError: errorMsg });
            console.error("FetchUser Error:", errorMsg);
        } finally {
            set({ fetchUserLoading: false });
        }
    },
}));
