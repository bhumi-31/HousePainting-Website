import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Shield, Star, Wand2, Download, Trash2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button, Input, useToast } from "../components/ui/index";
import { authApi, reviewsApi, aiApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchUserReviews();
    fetchSavedDesigns();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getProfile();
      const userData = response.user || response;
      setProfile(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } catch (error) {
      toast({ title: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await reviewsApi.getAll({ limit: 50 });
      // Filter reviews by current user
      const allReviews = response.reviews || [];
      const myReviews = allReviews.filter(
        (review) => review.user?._id === user?.id || review.user?._id === user?._id
      );
      setUserReviews(myReviews);
    } catch (error) {
      console.log("Could not fetch user reviews");
    }
  };

  const fetchSavedDesigns = async () => {
    try {
      const response = await aiApi.getSavedDesigns();
      setSavedDesigns(response.designs || []);
    } catch (error) {
      console.log("Could not fetch saved designs");
    }
  };

  const handleDownloadDesign = (design) => {
    const link = document.createElement("a");
    link.href = design.image;
    link.download = `room-design-${new Date(design.createdAt).getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await authApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      toast({ title: "Profile updated successfully!" });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast({ title: error.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-primary">
        <div className="container-custom">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground font-heading font-bold text-4xl">
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">
                {profile?.name || "User"}
              </h1>
              <p className="text-primary-foreground/70 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {profile?.email}
              </p>
              {profile?.role === "admin" && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                  <Shield className="w-4 h-4" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid gap-8">
            {/* Profile Information Card */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-foreground">
                  Profile Information
                </h2>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                {/* Name */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    {editing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-foreground">{profile?.name || "Not set"}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Email Address</label>
                    <p className="font-medium text-foreground">{profile?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Phone Number</label>
                    {editing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-foreground">{profile?.phone || "Not set"}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Address</label>
                    {editing ? (
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your address"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-foreground">{profile?.address || "Not set"}</p>
                    )}
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Member Since</label>
                    <p className="font-medium text-foreground">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Reviews Card */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-foreground">
                  My Reviews ({userReviews.length})
                </h2>
                <Link to="/reviews">
                  <Button variant="outline" size="sm">
                    View All Reviews
                  </Button>
                </Link>
              </div>

              {userReviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">You haven't written any reviews yet.</p>
                  <Link to="/portfolio">
                    <Button variant="outline" className="mt-4">
                      Browse Portfolio to Review
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <p className="font-semibold text-foreground mb-1">{review.title}</p>
                      )}
                      <p className="text-muted-foreground text-sm line-clamp-2">{review.text}</p>
                      {review.project && (
                        <Link
                          to={`/portfolio/${review.project._id || review.project}`}
                          className="text-accent text-sm mt-2 inline-block hover:underline"
                        >
                          View Project →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved AI Designs Card */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-foreground">
                  Saved AI Designs ({savedDesigns.length})
                </h2>
                <Link to="/visualizer">
                  <Button variant="outline" size="sm">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </Link>
              </div>

              {savedDesigns.length === 0 ? (
                <div className="text-center py-8">
                  <Wand2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No saved designs yet.</p>
                  <Link to="/visualizer">
                    <Button variant="outline" className="mt-4">
                      Try AI Room Visualizer
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedDesigns.slice(0, 6).map((design, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
                      <img
                        src={design.image}
                        alt={design.prompt}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownloadDesign(design)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-2 bg-card">
                        <p className="text-xs text-muted-foreground line-clamp-1">{design.prompt}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/quote" className="block">
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-accent transition-colors">
                  <h3 className="font-heading font-bold text-foreground mb-2">Request a Quote</h3>
                  <p className="text-muted-foreground text-sm">
                    Get a free estimate for your next painting project.
                  </p>
                </div>
              </Link>
              <Link to="/portfolio" className="block">
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-accent transition-colors">
                  <h3 className="font-heading font-bold text-foreground mb-2">View Portfolio</h3>
                  <p className="text-muted-foreground text-sm">
                    Browse our completed projects for inspiration.
                  </p>
                </div>
              </Link>
            </div>

            {/* Logout Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
              >
                Logout from Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
