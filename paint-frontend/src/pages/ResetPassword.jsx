import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Button, Input, useToast } from "../components/ui/index";
import { authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: setAuthData } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(token, formData.password);
      
      // Auto login after successful password reset
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      
      setSuccess(true);
      toast({ title: "Password reset successful!" });
      
      // Redirect to home after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(true);
      toast({ 
        title: err.message || "Failed to reset password", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Error state - invalid or expired token
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-heading font-bold text-xl">HP</span>
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-foreground">House</p>
              <p className="font-heading font-bold text-lg text-accent -mt-1">Painters</p>
            </div>
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              Link Expired
            </h1>
            <p className="text-muted-foreground mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            
            <Link to="/forgot-password">
              <Button className="w-full btn-primary">
                Request New Link
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-heading font-bold text-xl">HP</span>
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-foreground">House</p>
              <p className="font-heading font-bold text-lg text-accent -mt-1">Painters</p>
            </div>
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              Password Reset!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully reset. You're now logged in!
            </p>
            
            <p className="text-sm text-muted-foreground">
              Redirecting to home...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-heading font-bold text-xl">HP</span>
          </div>
          <div>
            <p className="font-heading font-bold text-lg text-foreground">House</p>
            <p className="font-heading font-bold text-lg text-accent -mt-1">Painters</p>
          </div>
        </Link>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-2">
            Set New Password
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          <Link to="/login" className="hover:text-accent">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
