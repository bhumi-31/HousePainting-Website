import { useState, useEffect } from "react";
import { Mail, Eye, Reply, Trash2, Archive, CheckCircle, Clock, MessageSquare, X } from "lucide-react";
import { Button, Input, Textarea, useToast } from "../../components/ui/index";
import { contactApi } from "../../lib/api";

const AdminContacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusCounts, setStatusCounts] = useState({ new: 0, read: 0, replied: 0, archived: 0, total: 0 });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await contactApi.getAll(params);
      setContacts(response.contacts || []);
      setStatusCounts(response.statusCounts || { new: 0, read: 0, replied: 0, archived: 0, total: 0 });
    } catch (error) {
      toast({ title: "Failed to load contacts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = async (contact) => {
    try {
      const response = await contactApi.getById(contact._id);
      setSelectedContact(response.contact);
      fetchContacts(); // Refresh to update status
    } catch (error) {
      toast({ title: "Failed to load contact details", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await contactApi.updateStatus(id, { status });
      toast({ title: `Contact marked as ${status}` });
      fetchContacts();
      if (selectedContact?._id === id) {
        setSelectedContact({ ...selectedContact, status });
      }
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast({ title: "Please enter a reply message", variant: "destructive" });
      return;
    }

    setReplying(true);
    try {
      await contactApi.reply(selectedContact._id, replyMessage);
      toast({ title: "Reply sent successfully!" });
      setShowReplyModal(false);
      setReplyMessage("");
      fetchContacts();
      setSelectedContact({ ...selectedContact, status: "replied" });
    } catch (error) {
      toast({ title: error.message || "Failed to send reply", variant: "destructive" });
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await contactApi.delete(id);
      toast({ title: "Contact deleted" });
      fetchContacts();
      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }
    } catch (error) {
      toast({ title: "Failed to delete contact", variant: "destructive" });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-yellow-100 text-yellow-800",
      replied: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.new}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground">Manage customer inquiries and messages</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All", count: statusCounts.total },
          { key: "new", label: "New", count: statusCounts.new },
          { key: "read", label: "Read", count: statusCounts.read },
          { key: "replied", label: "Replied", count: statusCounts.replied },
          { key: "archived", label: "Archived", count: statusCounts.archived },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === tab.key
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Messages</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => handleViewContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-secondary/50 transition-colors ${
                    selectedContact?._id === contact._id ? "bg-secondary" : ""
                  } ${contact.status === "new" ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{contact.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                    </div>
                    {getStatusBadge(contact.status)}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{contact.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{contact.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(contact.createdAt).toLocaleDateString()} at{" "}
                    {new Date(contact.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Message Details</h2>
          </div>
          
          {selectedContact ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedContact.name}</h3>
                  <a href={`mailto:${selectedContact.email}`} className="text-accent hover:underline">
                    {selectedContact.email}
                  </a>
                  {selectedContact.phone && (
                    <p className="text-muted-foreground">{selectedContact.phone}</p>
                  )}
                </div>
                {getStatusBadge(selectedContact.status)}
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-semibold text-foreground">{selectedContact.subject}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-6">
                <p>Received: {new Date(selectedContact.createdAt).toLocaleString()}</p>
                {selectedContact.repliedAt && (
                  <p>
                    Replied: {new Date(selectedContact.repliedAt).toLocaleString()}
                    {selectedContact.repliedBy && ` by ${selectedContact.repliedBy.name}`}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowReplyModal(true)}
                  className="gap-2"
                  disabled={selectedContact.status === "replied"}
                >
                  <Reply className="w-4 h-4" />
                  {selectedContact.status === "replied" ? "Already Replied" : "Reply"}
                </Button>
                
                {selectedContact.status !== "archived" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedContact._id, "archived")}
                    className="gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(selectedContact._id)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold">Reply to {selectedContact.name}</h3>
              <button onClick={() => setShowReplyModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Original Message:</p>
                <p className="text-sm">{selectedContact.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Reply</label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={6}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1"
                  disabled={replying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReply}
                  className="flex-1"
                  disabled={replying || !replyMessage.trim()}
                >
                  {replying ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
