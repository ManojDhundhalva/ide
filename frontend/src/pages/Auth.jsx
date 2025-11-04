import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

const Auth = () => {
  const responseGoogle = useAuth();

  const handleError = (error) => {
    console.error("Google login failed:", error);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: handleError,
    flow: "auth-code",
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh"}}>
        <button onClick={googleLogin}>Continue with Google</button>
      </div>
    </>
  );
};

export default Auth;
