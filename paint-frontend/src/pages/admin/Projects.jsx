import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Star, Eye, X } from "lucide-react";
import { Button, Input, Textarea, useToast } from "../../components/ui/index";
import { portfolioApi, uploadApi } from "../../lib/api";

const roomTypes = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "exterior", label: "Exterior" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

const AdminProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    roomType: "living_room",
    paintBrand: "",
    colors: "",
    duration: "",
    size: "",
    cost: "",
    clientName: "",
    testimonial: "",
    featured: false,
  });
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await portfolioApi.getAll({ limit: 50 });
      setProjects(response.projects || []);
    } catch (error) {
      toast({ title: "Failed to fetch projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrls = {};
      
      // Upload images to Cloudinary if provided
      if (beforeImage || afterImage) {
        toast({ title: "Uploading images...", description: "Please wait while we upload your images." });
        try {
          const uploadResponse = await uploadApi.project(beforeImage, afterImage, []);
          console.log("Upload response:", uploadResponse);
          if (uploadResponse.data) {
            imageUrls = uploadResponse.data;
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast({ title: "Image upload failed", description: uploadError.message, variant: "destructive" });
          setSubmitting(false);
          return;
        }
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        roomType: formData.roomType,
        paintBrand: formData.paintBrand,
        colors: formData.colors ? formData.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
        duration: formData.duration,
        size: formData.size ? Number(formData.size) : undefined,
        cost: formData.cost ? Number(formData.cost) : undefined,
        clientName: formData.clientName || undefined,
        testimonial: formData.testimonial || undefined,
        featured: formData.featured,
        // Add image URLs if uploaded
        ...(imageUrls.beforeImage && { beforeImage: imageUrls.beforeImage }),
        ...(imageUrls.afterImage && { afterImage: imageUrls.afterImage }),
        ...(imageUrls.additionalImages && { additionalImages: imageUrls.additionalImages }),
      };

      console.log("Creating project with data:", projectData);

      if (editingProject) {
        await portfolioApi.update(editingProject._id, projectData);
        toast({ title: "Project updated successfully!", description: "Your project has been saved." });
      } else {
        await portfolioApi.create(projectData);
        toast({ title: "Project created successfully!", description: "Your new project is now live." });
      }

      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      toast({ title: error.message || "Failed to save project", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      location: project.location || "",
      roomType: project.roomType || "living_room",
      paintBrand: project.paintBrand || "",
      colors: project.colors?.join(", ") || "",
      duration: project.duration || "",
      size: project.size?.toString() || "",
      cost: project.cost?.toString() || "",
      clientName: project.clientName || "",
      testimonial: project.testimonial || "",
      featured: project.featured || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await portfolioApi.delete(id);
      toast({ title: "Project deleted" });
      fetchProjects();
    } catch (error) {
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await portfolioApi.toggleFeatured(id);
      fetchProjects();
    } catch (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      roomType: "living_room",
      paintBrand: "",
      colors: "",
      duration: "",
      size: "",
      cost: "",
      clientName: "",
      testimonial: "",
      featured: false,
    });
    setBeforeImage(null);
    setAfterImage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-4 font-semibold">Title</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">Location</th>
                <th className="text-left p-4 font-semibold hidden lg:table-cell">Room Type</th>
                <th className="text-left p-4 font-semibold hidden lg:table-cell">Views</th>
                <th className="text-left p-4 font-semibold">Featured</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-t border-border">
                  <td className="p-4">{project.title}</td>
                  <td className="p-4 hidden md:table-cell">{project.location}</td>
                  <td className="p-4 hidden lg:table-cell capitalize">
                    {project.roomType?.replace("_", " ")}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {project.viewCount || 0}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleFeatured(project._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        project.featured ? "bg-accent text-accent-foreground" : "bg-secondary"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${project.featured ? "fill-current" : ""}`} />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-muted-foreground">
                    No projects found. Create your first project!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold">
                {editingProject ? "Edit Project" : "Add Project"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input name="location" value={formData.location} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Room Type</label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {roomTypes.map((room) => (
                      <option key={room.value} value={room.value}>{room.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Paint Brand</label>
                  <Input name="paintBrand" value={formData.paintBrand} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Colors (comma separated)</label>
                  <Input name="colors" value={formData.colors} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <Input name="duration" value={formData.duration} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Size (sq ft)</label>
                  <Input type="number" name="size" value={formData.size} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cost</label>
                  <Input type="number" name="cost" value={formData.cost} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Before Image {!editingProject && <span className="text-destructive">*</span>}
                  </label>
                  <Input type="file" accept="image/*" onChange={(e) => setBeforeImage(e.target.files[0])} />
                  <p className="text-xs text-muted-foreground mt-1">Image will be uploaded to cloud storage</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    After Image {!editingProject && <span className="text-destructive">*</span>}
                  </label>
                  <Input type="file" accept="image/*" onChange={(e) => setAfterImage(e.target.files[0])} />
                  <p className="text-xs text-muted-foreground mt-1">Image will be uploaded to cloud storage</p>
                </div>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Client Information (Optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client Name</label>
                    <Input name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="e.g., John D." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Client Testimonial</label>
                    <Input name="testimonial" value={formData.testimonial} onChange={handleInputChange} placeholder="What did the client say?" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Featured project</label>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1" disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      {editingProject ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <>{editingProject ? "Update" : "Create"} Project</>
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

export default AdminProjects;
