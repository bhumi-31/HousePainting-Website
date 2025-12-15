import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle, Phone } from "lucide-react";
import { Button, Input, useToast } from "../components/ui/index";
import { authApi } from "../lib/api";
import logo from "../assets/logo.jpg";
import heroImage from "../assets/deck-painting.jpg";

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
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={heroImage}
          alt="Professional House Painting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-transparent"></div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="Chandan House Painting" className="h-16 w-auto" />
          </Link>

          {/* Hero Text */}
          <div className="max-w-md">
            <h1 className="text-4xl font-heading font-bold mb-6 leading-tight">
              We're Here to Help
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Don't worry if you've forgotten your password. We'll help you get back into your account in no time.
            </p>

            {/* Support Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-white/90 font-medium mb-2">Need additional help?</p>
              <p className="text-white/70 text-sm mb-3">
                Contact our support team for assistance with your account.
              </p>
              <div className="flex items-center gap-2 text-white/80">
                <Phone className="w-4 h-4" />
                <span>705-951-0764</span>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-white/50 text-sm">
            Trusted by homeowners across Ontario
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-secondary via-background to-secondary">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <img src={logo} alt="Chandan House Painting" className="h-16 w-auto" />
            </Link>
          </div>

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
                      className="h-12"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/25"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
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
                  <Button variant="outline" className="w-full h-12">
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

          <p className="text-center mt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
