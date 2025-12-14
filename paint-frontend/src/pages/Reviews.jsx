import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageCircle, Plus, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button, Input, Textarea, useToast, ReviewCardSkeleton } from "../components/ui/index";
import { reviewsApi, portfolioApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-painting.jpg";

const Reviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    text: "",
    project: "",
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
    fetchProjects();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getAll({ approved: true, limit: 50 });
      setReviews(response.reviews || []);
    } catch (error) {
      // Default reviews for demo
      setReviews([
        {
          _id: "1",
          user: { _id: "demo1", name: "Sarah J." },
          rating: 5,
          title: "Exceptional Service!",
          text: "The team did an amazing job on our living room. Professional, punctual, and the results are stunning!",
          createdAt: new Date().toISOString(),
          helpfulCount: 12,
        },
        {
          _id: "2",
          user: { _id: "demo2", name: "Michael C." },
          rating: 5,
          title: "Highly Recommend",
          text: "We've used their services twice now and both times exceeded expectations. Great attention to detail.",
          createdAt: new Date().toISOString(),
          helpfulCount: 8,
        },
        {
          _id: "3",
          user: { _id: "demo3", name: "Emily R." },
          rating: 4,
          title: "Great Work",
          text: "Very professional team. They completed our exterior painting on time and the results look fantastic.",
          createdAt: new Date().toISOString(),
          helpfulCount: 5,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewsApi.getStats();
      setStats(response.stats);
    } catch (error) {
      setStats({
        totalReviews: 150,
        averageRating: "4.8",
        ratingDistribution: { 5: 100, 4: 35, 3: 10, 2: 3, 1: 2 },
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await portfolioApi.getAll();
      setProjects(response.projects || []);
    } catch (error) {
      console.log("Could not fetch projects");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to submit a review", variant: "destructive" });
      return;
    }

    if (formData.text.length < 10) {
      toast({ title: "Review must be at least 10 characters", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        rating: formData.rating,
        title: formData.title,
        text: formData.text,
        project: formData.project || undefined,
      };

      await reviewsApi.create(reviewData);
      toast({ title: "Review submitted!" });

      setShowModal(false);
      resetForm();
      fetchReviews();
      fetchStats();
    } catch (error) {
      toast({ title: error.message || "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (id) => {
    if (!user) {
      toast({ title: "Please login to mark as helpful", variant: "destructive" });
      return;
    }
    try {
      await reviewsApi.toggleHelpful(id);
      fetchReviews();
    } catch (error) {
      toast({ title: "Already marked as helpful", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      rating: 5,
      title: "",
      text: "",
      project: "",
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-primary">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Reviews" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-primary-foreground mb-4">
            CUSTOMER REVIEWS
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-6">
            See what our satisfied customers have to say about our services
          </p>
          {user ? (
            <Button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="w-4 h-4 mr-2" /> Write a Review
            </Button>
          ) : (
            <Link to="/login">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Login to Write a Review
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Overall Stats */}
      {stats && (
        <section className="py-12 border-b border-border bg-card">
          <div className="container-custom">
            <h2 className="text-2xl font-heading font-bold text-center mb-8">Overall Rating</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-background rounded-2xl p-6 shadow-sm">
                <p className="text-6xl font-heading font-black text-accent">{stats.averageRating}</p>
                <div className="flex justify-center gap-1 my-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(Number(stats.averageRating))
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground">out of 5 stars</p>
              </div>
              <div className="bg-background rounded-2xl p-6 shadow-sm">
                <p className="text-6xl font-heading font-black text-foreground">{stats.totalReviews}</p>
                <p className="text-muted-foreground mt-3">Total Reviews</p>
              </div>
              <div className="bg-background rounded-2xl p-6 shadow-sm">
                <p className="text-6xl font-heading font-black text-green-500">98%</p>
                <p className="text-muted-foreground mt-3">Would Recommend</p>
              </div>
            </div>

            {/* Rating Distribution */}
            {stats.ratingDistribution && (
              <div className="mt-8 max-w-md mx-auto">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDistribution[star] || 0;
                  const total = Object.values(stats.ratingDistribution).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-sm w-12 flex items-center gap-1">
                        {star} <Star className="w-3 h-3 fill-accent text-accent" />
                      </span>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reviews List */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl font-heading font-bold mb-6">Customer Testimonials</h2>
          
          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-card rounded-2xl p-6 border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-accent-foreground font-bold">
                          {review.user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{review.user?.name || "Customer"}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {review.project && (
                    <div className="mb-3">
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                        Project: {review.project.title || "Portfolio Project"}
                      </span>
                    </div>
                  )}

                  {review.title && (
                    <h3 className="font-semibold text-foreground mb-2">{review.title}</h3>
                  )}
                  <p className="text-muted-foreground mb-4">{review.text}</p>

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <button 
                      onClick={() => handleHelpful(review._id)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Helpful ({review.helpfulCount || 0})</span>
                    </button>
                  </div>

                  {review.adminResponse && (
                    <div className="mt-4 p-4 bg-secondary rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-sm">Response from House Painters</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.adminResponse.text}</p>
                    </div>
                  )}
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No reviews yet. Be the first to write one!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold">
                Write a Review
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= formData.rating
                            ? "fill-accent text-accent"
                            : "text-muted-foreground hover:text-accent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Selection (optional) */}
              {projects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Related Project (optional)
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a project from portfolio...</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Review Title (optional)</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Summarize your experience"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Tell us about your experience with our services..."
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 10 characters ({formData.text.length}/10)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={submitting || formData.text.length < 10}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reviews;
