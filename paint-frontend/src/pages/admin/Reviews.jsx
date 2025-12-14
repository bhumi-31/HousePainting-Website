import { useState, useEffect } from "react";
import { Check, X, MessageCircle, Star, Trash2 } from "lucide-react";
import { Button, Textarea, useToast } from "../../components/ui/index";
import { reviewsApi } from "../../lib/api";

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const params = {};
      if (filter) params.approved = filter === "approved";
      const response = await reviewsApi.getAll(params);
      setReviews(response.reviews || []);
    } catch (error) {
      toast({ title: "Failed to fetch reviews", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await reviewsApi.approve(id);
      toast({ title: "Review approved" });
      fetchReviews();
    } catch (error) {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async (id) => {
    try {
      await reviewsApi.reject(id);
      toast({ title: "Review rejected" });
      fetchReviews();
    } catch (error) {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await reviewsApi.delete(id);
      toast({ title: "Review deleted" });
      fetchReviews();
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleRespond = async () => {
    if (!respondingTo || !responseText.trim()) return;
    try {
      await reviewsApi.respond(respondingTo, responseText);
      toast({ title: "Response added" });
      setRespondingTo(null);
      setResponseText("");
      fetchReviews();
    } catch (error) {
      toast({ title: "Failed to respond", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Reviews</h2>
          <p className="text-muted-foreground">Manage customer reviews</p>
        </div>
        <div className="flex gap-2">
          {["", "approved", "pending"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary hover:bg-accent/20"
              }`}
            >
              {status === "" ? "All" : status === "approved" ? "Approved" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground font-bold">
                      {review.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{review.user?.name || "Customer"}</p>
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
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    review.approved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {review.approved ? "Approved" : "Pending"}
                </span>
              </div>

              {review.title && (
                <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
              )}
              <p className="text-muted-foreground mb-4">{review.text}</p>

              {review.adminResponse && (
                <div className="bg-secondary rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold">Your Response</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.adminResponse.text}</p>
                </div>
              )}

              {respondingTo === review._id && (
                <div className="mb-4 space-y-3">
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleRespond} size="sm" className="btn-primary">
                      Send Response
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                {!review.approved && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(review._id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(review._id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {!review.adminResponse && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRespondingTo(review._id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" /> Respond
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteConfirm({ open: true, id: review._id })}
                  className="text-destructive hover:bg-destructive/10 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                    {/* Custom Delete Confirmation Modal */}
                    {deleteConfirm.open && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-xs border border-border animate-fade-in">
                          <h3 className="font-bold text-lg mb-2 text-destructive">Delete Review?</h3>
                          <p className="mb-4 text-sm text-muted-foreground">Are you sure you want to delete this review? This action cannot be undone.</p>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setDeleteConfirm({ open: false, id: null })}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="btn-destructive"
                              onClick={async () => {
                                setDeleteConfirm({ open: false, id: null });
                                await handleDelete(deleteConfirm.id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No reviews found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
