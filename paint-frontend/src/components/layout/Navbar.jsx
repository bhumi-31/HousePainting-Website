import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown, User, Settings, LogOut, Shield } from "lucide-react";
import logo from "../../assets/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/index";
import { cn } from "../../lib/utils";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "AI Visualizer", path: "/visualizer" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Reviews", path: "/reviews" },
  { name: "Get Quote", path: "/quote" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const profileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Chandan House Painting" className="h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-medium transition-colors hover:text-accent",
                  isActive(link.path) ? "text-accent" : "text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+17059510764"
              className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
            >
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Call Us</p>
                <p className="font-semibold">+1 (705) 951-0764</p>
              </div>
            </a>

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <span className="font-medium text-foreground">
                    {user.name || "User"}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showProfileMenu && "rotate-180")} />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-lg border border-border py-2 animate-fade-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-accent-foreground font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>My Profile</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors"
                        >
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border pt-2">
                      <button
                        onClick={() => { logout(); setShowProfileMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 w-full hover:bg-secondary transition-colors text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "font-medium py-2 transition-colors",
                    isActive(link.path) ? "text-accent" : "text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary"
                    >
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-accent-foreground font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">View Profile</p>
                      </div>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full gap-2 text-destructive" onClick={logout}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Login / Sign Up</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
