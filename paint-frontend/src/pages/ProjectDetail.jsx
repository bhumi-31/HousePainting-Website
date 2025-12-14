import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Clock, DollarSign, Palette, User, Star, MessageSquare, X, Edit2, Trash2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button, Input, Textarea, useToast } from "../components/ui/index";
import { portfolioApi, reviewsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import exteriorImage from "../assets/exterior-painting.jpg";
import interiorImage from "../assets/interior-painting.jpg";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [projectReviews, setProjectReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAfter, setShowAfter] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    text: "",
  });

  useEffect(() => {
    fetchProject();
    fetchProjectReviews();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await portfolioApi.getById(id);
      setProject(response.project);
    } catch (error) {
      setProject({
        _id: id,
        title: "Beautiful Home Transformation",
        description: "A complete interior and exterior painting project that transformed this home into a modern masterpiece.",
        location: "Downtown Area",
        beforeImage: exteriorImage,
        afterImage: interiorImage,
        roomType: "living_room",
        paintBrand: "Premium Paints",
        colors: ["Soft White", "Gray Accent"],
        duration: "5 days",
        cost: 3500,
        clientName: "John D.",
        testimonial: "Amazing work! The team was professional and the results exceeded our expectations.",
        views: 245,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectReviews = async () => {
    try {
      const response = await reviewsApi.getAll({ project: id, approved: true });
      setProjectReviews(response.reviews || []);
    } catch (error) {
      console.log("Could not fetch project reviews");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to submit a review", variant: "destructive" });
      return;
    }

    if (reviewForm.text.length < 10) {
      toast({ title: "Review must be at least 10 characters", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await reviewsApi.update(editingReview._id, {
          rating: reviewForm.rating,
          title: reviewForm.title,
          text: reviewForm.text,
        });
        toast({ title: "Review updated!" });
      } else {
        await reviewsApi.create({
          rating: reviewForm.rating,
          title: reviewForm.title,
          text: reviewForm.text,
          project: id,
        });
        toast({ title: "Review submitted!" });
      }
      setShowReviewModal(false);
      setEditingReview(null);
      setReviewForm({ rating: 5, title: "", text: "" });
      fetchProjectReviews();
    } catch (error) {
      toast({ title: error.message || "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title || "",
      text: review.text,
    });
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewsApi.delete(reviewId);
      toast({ title: "Review deleted!" });
      fetchProjectReviews();
    } catch (error) {
      toast({ title: error.message || "Failed to delete review", variant: "destructive" });
    }
  };

  // Check if current user owns a review
  const isOwnReview = (review) => {
    return user && review.user && (review.user._id === user._id || review.user._id === user.id);
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
      {/* Hero */}
      <section className="relative py-24 bg-primary">
        <div className="relative container-custom">
          <Link to="/portfolio" className="inline-flex items-center text-primary-foreground/80 hover:text-accent mb-4">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Portfolio
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-primary-foreground mb-4">
            {project?.title}
          </h1>
          <div className="flex items-center gap-4 text-primary-foreground/80">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {project?.location}
            </span>
            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
              {project?.roomType?.replace("_", " ")}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Before/After Toggle */}
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setShowAfter(false)}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      !showAfter ? "bg-accent text-accent-foreground" : "bg-secondary"
                    }`}
                  >
                    Before
                  </button>
                  <button
                    onClick={() => setShowAfter(true)}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      showAfter ? "bg-accent text-accent-foreground" : "bg-secondary"
                    }`}
                  >
                    After
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-secondary">
                  <img
                    src={showAfter ? (project?.afterImage || interiorImage) : (project?.beforeImage || exteriorImage)}
                    alt={showAfter ? "After" : "Before"}
                    className="w-full max-h-[600px] object-contain transition-all duration-500"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Project Details</h2>
              <p className="text-muted-foreground text-lg mb-8">{project?.description}</p>

              {/* Colors */}
              <div className="mb-8">
                <h3 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" /> Colors Used
                </h3>
                <div className="flex gap-3">
                  {project?.colors?.map((color) => (
                    <span key={color} className="px-4 py-2 bg-secondary rounded-lg">
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {project?.testimonial && (
                <div className="bg-secondary rounded-2xl p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground italic mb-4">"{project.testimonial}"</p>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">{project.clientName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border sticky top-24">
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">Project Info</h3>
                
                <div className="space-y-4 mb-6">
                  {project?.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">{project.duration}</p>
                      </div>
                    </div>
                  )}
                  {project?.cost && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Project Cost</p>
                        <p className="font-semibold">${project.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {project?.paintBrand && (
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Paint Brand</p>
                        <p className="font-semibold">{project.paintBrand}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/quote" className="block mb-3">
                  <Button className="w-full btn-primary">
                    Get Similar Results
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                ) : (
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Login to Review
                    </Button>
                  </Link>
                )}
              </div>

              {/* Project Reviews */}
              {projectReviews.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mt-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                    Reviews ({projectReviews.length})
                  </h3>
                  <div className="space-y-4">
                    {projectReviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                              <span className="text-accent-foreground text-sm font-bold">
                                {review.user?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{review.user?.name || "Customer"}</p>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Edit/Delete buttons for own reviews */}
                          {isOwnReview(review) && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="p-1.5 hover:bg-secondary rounded transition-colors"
                                title="Edit your review"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                                title="Delete your review"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{review.text}</p>
                      </div>
                    ))}
                  </div>
                  {projectReviews.length > 3 && (
                    <Link to="/reviews" className="text-accent text-sm font-semibold mt-4 block">
                      View all reviews →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold">
                {editingReview ? "Edit Your Review" : `Review: ${project?.title}`}
              </h3>
              <button onClick={() => { setShowReviewModal(false); setEditingReview(null); setReviewForm({ rating: 5, title: "", text: "" }); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= reviewForm.rating
                            ? "fill-accent text-accent"
                            : "text-muted-foreground hover:text-accent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (optional)</label>
                <Input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Summarize your experience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <Textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="Share your thoughts about this project..."
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 10 characters ({reviewForm.text.length}/10)
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowReviewModal(false); setEditingReview(null); setReviewForm({ rating: 5, title: "", text: "" }); }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={submitting || reviewForm.text.length < 10}
                >
                  {submitting ? "Submitting..." : (editingReview ? "Update Review" : "Submit Review")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDetail;
