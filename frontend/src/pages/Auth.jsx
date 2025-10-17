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
      <button onClick={googleLogin}>Auth</button>
    </>
  );
};

export default Auth;
