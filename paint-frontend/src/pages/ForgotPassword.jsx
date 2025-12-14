import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button, Input, useToast } from "../components/ui/index";
import { authApi } from "../lib/api";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setEmailSent(true);
      toast({ title: "Reset link sent to your email!" });
    } catch (error) {
      toast({ 
        title: error.message || "Failed to send reset email", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

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
          {!emailSent ? (
            <>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              
              <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-2">
                Forgot Password?
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                No worries! Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                Check Your Email
              </h1>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
              </p>
              
              <div className="bg-secondary rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setEmailSent(false)} 
                    className="text-accent hover:underline font-semibold"
                  >
                    try again
                  </button>
                </p>
              </div>

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          <p className="text-center text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-accent hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          <Link to="/" className="hover:text-accent">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
