import { useEffect, useRef, useState } from "react";
import { useToast } from "./ui/index";
import { authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ onSuccess, text = "signin_with" }) => {
  // Debug: Log the value of GOOGLE_CLIENT_ID from Vite
  console.log("GOOGLE_CLIENT_ID from Vite:", GOOGLE_CLIENT_ID);
  const buttonRef = useRef(null);
  const { toast } = useToast();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Google Identity Services is loaded
    if (!window.google || !GOOGLE_CLIENT_ID) {
      console.log("Google Sign-In not configured");

      return;
    }

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    // Render the button
    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 400,
        text: text,
        shape: "rectangular",
        logo_alignment: "left",
      });
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      const result = await authApi.googleAuth(response.credential);

      // Store token and user data
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Update auth context
      if (setUser) {
        setUser(result.user);
      }

      toast({ title: "Login successful!" });

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate("/");
      }
    } catch (error) {
      toast({
        title: error.message || "Google sign-in failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If Google Client ID is not configured, show a fallback
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={buttonRef} className="google-signin-button" />
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          Signing in...
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
