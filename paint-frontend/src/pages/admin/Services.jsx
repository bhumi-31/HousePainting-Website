import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button, Input, Textarea, useToast } from "../../components/ui/index";
import { servicesApi, uploadApi } from "../../lib/api";

const categories = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "both", label: "Both" },
];

const AdminServices = () => {
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimatedTimeline: "",
    features: "",
    category: "residential",
  });
  const [images, setImages] = useState([]);
  const MAX_IMAGES = 5;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesApi.getAll();
      setServices(response.services || []);
    } catch (error) {
      toast({ title: "Failed to fetch services", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrls = [];
      if (images.length > 0) {
        const uploadResponse = await uploadApi.multiple(images);
        if (uploadResponse.data) {
          imageUrls = uploadResponse.data.map((img) => img.url);
        }
      }

      const serviceData = {
        name: formData.name,
        description: formData.description,
        estimatedTimeline: formData.estimatedTimeline || undefined,
        features: formData.features ? formData.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
        category: formData.category,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      if (editingService) {
        await servicesApi.update(editingService._id, serviceData);
        toast({ title: "Service updated successfully!", description: "Your changes have been saved." });
      } else {
        await servicesApi.create(serviceData);
        toast({ title: "Service created successfully!", description: "Your new service is now available." });
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (error) {
      toast({ title: error.message || "Failed to save service", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      estimatedTimeline: service.estimatedTimeline || "",
      features: service.features?.join(", ") || "",
      category: service.category || "residential",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await servicesApi.delete(id);
      toast({ title: "Service deleted" });
      fetchServices();
    } catch (error) {
      toast({ title: "Failed to delete service", variant: "destructive" });
    }
  };

  const toggleStatus = async (id) => {
    try {
      await servicesApi.toggleStatus(id);
      toast({ title: "Status updated" });
      fetchServices();
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      estimatedTimeline: "",
      features: "",
      category: "residential",
    });
    setImages([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Services</h2>
          <p className="text-muted-foreground">Manage your painting services</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground">
                    {service.name}
                  </h3>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      service.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <button
                  onClick={() => toggleStatus(service._id)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  {service.isActive ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Timeline</p>
                  <p className="font-semibold">
                    {service.estimatedTimeline || "Varies"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold capitalize">{service.category || "Both"}</p>
                </div>
              </div>

              {service.features?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-secondary text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {service.features.length > 3 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">
                      +{service.features.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(service)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(service._id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No services found. Create your first service!
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold">
                {editingService ? "Edit Service" : "Add Service"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Name</label>
                <Input name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Timeline</label>
                <Input
                  name="estimatedTimeline"
                  value={formData.estimatedTimeline}
                  onChange={handleInputChange}
                  placeholder="e.g., 2-5 days, 1-2 weeks"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Features (comma separated)</label>
                <Input
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Images</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > MAX_IMAGES) {
                      toast({ title: `You can add only ${MAX_IMAGES} images.`, variant: "destructive" });
                      e.target.value = null;
                      setImages([]);
                    } else {
                      setImages(files);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">You can add up to {MAX_IMAGES} images. Images will be uploaded to cloud storage.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1" disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      {editingService ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <>{editingService ? "Update" : "Create"} Service</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
