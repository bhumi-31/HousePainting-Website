import { useState, useEffect } from "react";
import { Eye, Send, Trash2, DollarSign, Check, X } from "lucide-react";
import { Button, Input, Textarea, useToast } from "../../components/ui/index";
import { quotesApi } from "../../lib/api";

const statusColors = {
  pending: "bg-yellow-500",
  reviewing: "bg-blue-500",
  quoted: "bg-purple-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-gray-500",
};

const AdminQuotes = () => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priceData, setPriceData] = useState({
    finalPrice: "",
    discount: "",
    adminResponse: "",
  });

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  const fetchQuotes = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const response = await quotesApi.getAll(params);
      setQuotes(response.quotes || []);
    } catch (error) {
      toast({ title: "Failed to fetch quotes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await quotesApi.updateStatus(id, status);
      toast({ title: `Status updated to ${status}` });
      fetchQuotes();
      if (selectedQuote?._id === id) {
        setSelectedQuote({ ...selectedQuote, status });
      }
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleSendQuote = async () => {
    if (!selectedQuote) return;
    try {
      await quotesApi.send(selectedQuote._id, {
        finalPrice: Number(priceData.finalPrice),
        discount: Number(priceData.discount) || 0,
        adminResponse: priceData.adminResponse,
      });
      toast({ title: "Quote sent to customer" });
      setShowDetail(false);
      fetchQuotes();
    } catch (error) {
      toast({ title: error.message || "Failed to send quote", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this quote?")) return;
    try {
      await quotesApi.delete(id);
      toast({ title: "Quote deleted" });
      fetchQuotes();
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const viewQuote = (quote) => {
    setSelectedQuote(quote);
    setPriceData({
      finalPrice: quote.finalPrice?.toString() || quote.estimatedPrice?.total?.toString() || "",
      discount: quote.discount?.toString() || "",
      adminResponse: quote.adminResponse || "",
    });
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Quotes</h2>
          <p className="text-muted-foreground">Manage customer quote requests</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["", "pending", "reviewing", "quoted", "accepted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary hover:bg-accent/20"
              }`}
            >
              {status || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Room</th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Size</th>
                  <th className="text-left p-4 font-semibold">Est. Price</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote._id} className="border-t border-border">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{quote.customerName}</p>
                        <p className="text-sm text-muted-foreground">{quote.customerEmail}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell capitalize">
                      {quote.roomType?.replace("_", " ")}
                    </td>
                    <td className="p-4 hidden lg:table-cell">{quote.roomSize} sq ft</td>
                    <td className="p-4 font-semibold">
                      ${quote.finalPrice?.toLocaleString() || quote.estimatedPrice?.toLocaleString() || "TBD"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          statusColors[quote.status] || "bg-gray-500"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewQuote(quote)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quote._id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-muted-foreground">
                      No quotes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote Detail Modal */}
      {showDetail && selectedQuote && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold">Quote Details</h3>
              <button onClick={() => setShowDetail(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedQuote.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedQuote.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedQuote.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-semibold capitalize">
                    {selectedQuote.roomType?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room Size</p>
                  <p className="font-semibold">{selectedQuote.roomSize} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paint Quality</p>
                  <p className="font-semibold capitalize">{selectedQuote.paintQuality}</p>
                </div>
              </div>

              {/* Status Actions */}
              <div>
                <p className="text-sm font-medium mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {["pending", "reviewing", "quoted", "accepted", "rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedQuote._id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedQuote.status === status
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary hover:bg-accent/20"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-secondary rounded-xl p-4">
                <h4 className="font-semibold mb-4">Quote Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Final Price</label>
                    <Input
                      type="number"
                      value={priceData.finalPrice}
                      onChange={(e) =>
                        setPriceData((prev) => ({ ...prev, finalPrice: e.target.value }))
                      }
                      placeholder="Enter final price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount (%)</label>
                    <Input
                      type="number"
                      value={priceData.discount}
                      onChange={(e) =>
                        setPriceData((prev) => ({ ...prev, discount: e.target.value }))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Message to Customer</label>
                  <Textarea
                    value={priceData.adminResponse}
                    onChange={(e) =>
                      setPriceData((prev) => ({ ...prev, adminResponse: e.target.value }))
                    }
                    placeholder="Enter your message..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowDetail(false)} className="flex-1">
                  Close
                </Button>
                <Button onClick={handleSendQuote} className="flex-1 btn-primary">
                  <Send className="w-4 h-4 mr-2" />
                  Send Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
