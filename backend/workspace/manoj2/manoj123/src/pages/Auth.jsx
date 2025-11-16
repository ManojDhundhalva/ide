import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const Auth = () => {
  const responseGoogle = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleError = (error) => {
    console.error("Google login failed:", error);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: handleError,
    flow: "auth-code",
  });

  return (
    <div style={{
      fontFamily: "Quicksand",
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #1e1e1e 0%, #252526 50%, #2d2d30 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "-10%",
        width: "500px",
        height: "500px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        filter: "blur(80px)",
        animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        right: "-10%",
        width: "600px",
        height: "600px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        filter: "blur(80px)",
        animation: "float 10s ease-in-out infinite reverse",
      }} />

      {/* Left Side - Welcome Section */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
      }}>
        {/* Logo/Brand Section */}
        <div style={{
          textAlign: "center",
          animation: "fadeInDown 1s ease-out",
          maxWidth: "500px",
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}>
            <span style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
            }}>
              &lt;/&gt;
            </span>
          </div>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "white",
            margin: "0 0 12px 0",
            letterSpacing: "-1px",
            lineHeight: "1.2",
          }}>
            Welcome to IDE
          </h1>
          <p style={{
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.9)",
            margin: "0 0 32px 0",
            fontWeight: "300",
            lineHeight: "1.5",
          }}>
            Your personal cloud development workspace
          </p>

          {/* Features List */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginTop: "40px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "white",
                  margin: "0 0 4px 0",
                }}>
                  Dedicated EC2 Instance
                </h4>
                <p style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.8)",
                  margin: 0,
                }}>
                  Your own cloud development environment
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "white",
                  margin: "0 0 4px 0",
                }}>
                  Project Management
                </h4>
                <p style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.8)",
                  margin: 0,
                }}>
                  Organize all your workspaces
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "white",
                  margin: "0 0 4px 0",
                }}>
                  Secure & Private
                </h4>
                <p style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.8)",
                  margin: 0,
                }}>
                  Your code is safe with us
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Section */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
      }}>
        {/* Auth Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "48px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          animation: "fadeInUp 1s ease-out",
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "32px",
          }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "600",
              color: "#1a202c",
              margin: "0 0 8px 0",
            }}>
              Get Started
            </h2>
            <p style={{
              fontSize: "15px",
              color: "#718096",
              margin: 0,
            }}>
              Sign in to access your workspace
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={googleLogin}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              fontFamily: "Quicksand",
              width: "100%",
              padding: "16px 24px",
              background: "white",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#2d3748",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              transition: "all 0.3s ease",
              transform: isHovered ? "translateY(-2px)" : "translateY(0)",
              boxShadow: isHovered 
                ? "0 12px 24px rgba(0, 0, 0, 0.15)" 
                : "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translate(0, 0);
            }
            50% {
              transform: translate(30px, 30px);
            }
          }

          @media (max-width: 768px) {
            .container {
              flex-direction: column !important;
            }
            
            h1 {
              font-size: 36px !important;
            }
            
            .auth-card {
              padding: 32px 24px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Auth;