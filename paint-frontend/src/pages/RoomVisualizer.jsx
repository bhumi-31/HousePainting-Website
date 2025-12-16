import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Wand2, Upload, Palette, Download, Save, Sparkles, RefreshCw, Image, Loader2, X, ArrowRight, Phone, Mail, CheckCircle, Lock } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button, Input, useToast } from "../components/ui/index";
import { aiApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import heroImage from "../assets/hero-painting.jpg";

const roomTypes = [
  { value: "livingRoom", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "diningRoom", label: "Dining Room" },
  { value: "office", label: "Home Office" },
];

const moods = [
  { value: "cozy", label: "Cozy & Warm" },
  { value: "modern", label: "Modern & Clean" },
  { value: "vibrant", label: "Vibrant & Bold" },
];

const RoomVisualizer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("livingRoom");
  const [selectedMood, setSelectedMood] = useState("modern");
  const [colorSuggestions, setColorSuggestions] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 10MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchColorSuggestions = async () => {
    try {
      const response = await aiApi.getColorSuggestions(selectedRoom, selectedMood);
      setColorSuggestions(response.colors || []);
    } catch (error) {
      console.error("Failed to get color suggestions:", error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Description required", description: "Please describe how you want your room to look", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setEstimatedTime(null);

    try {
      const response = await aiApi.visualize(prompt, uploadedImage);
      setGeneratedImage(response.image);
      toast({ title: "Success!", description: "Your room visualization is ready" });
    } catch (error) {
      if (error.message.includes("loading") || error.message.includes("503")) {
        setEstimatedTime(20);
        toast({ title: "AI Model Loading", description: "Please try again in 20 seconds.", variant: "warning" });
      } else {
        toast({ title: "Generation failed", description: error.message || "Failed to generate visualization", variant: "destructive" });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to save designs", variant: "destructive" });
      return;
    }
    if (!generatedImage) {
      toast({ title: "No design to save", description: "Generate a design first", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await aiApi.saveDesign(generatedImage, prompt, selectedRoom);
      toast({ title: "Design saved!", description: "You can view it in your profile" });
    } catch (error) {
      toast({ title: "Save failed", description: error.message || "Failed to save design", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `room-visualization-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addColorToPrompt = (color) => {
    const colorName = color.split(" ")[0];
    if (!prompt.includes(colorName)) {
      setPrompt((prev) => prev ? `${prev}, ${colorName} walls` : `${colorName} walls`);
    }
  };

  return (
    <Layout>
      {/* Hero Section - Same as Contact/Services */}
      <section className="relative py-32 bg-primary">
        <div className="absolute inset-0">
          <img src={heroImage} alt="AI Room Visualizer" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-foreground mb-4">
            AI ROOM VISUALIZER
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            See your dream room before you paint. Powered by AI technology.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>Free to Use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>Save to Profile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Column - Settings & Tips */}
            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">How It Works</h2>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Choose Room Type</h3>
                    <p className="text-sm text-muted-foreground">Select the type of room you want to visualize</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Describe Your Vision</h3>
                    <p className="text-sm text-muted-foreground">Tell us the colors, style, and mood you want</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Generate & Save</h3>
                    <p className="text-sm text-muted-foreground">Get your AI visualization and save it</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-secondary/50 rounded-2xl p-6 mt-8">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Pro Tips
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Be specific with colors (e.g., "light sage green")
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Mention lighting preferences
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Include style keywords (modern, rustic, minimal)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Describe furniture and decor
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-4 pt-6">
                <h3 className="font-heading font-bold text-foreground">Need Help?</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <a href="tel:7059510764" className="text-muted-foreground hover:text-accent">705-951-0764</a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <a href="mailto:chandansingh3016@gmail.com" className="text-muted-foreground hover:text-accent">chandansingh3016@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Right Column - Main Form & Result */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Create Your Visualization</h2>

                <div className="space-y-6">
                  {/* Room & Style Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Type</label>
                      <select
                        value={selectedRoom}
                        onChange={(e) => { setSelectedRoom(e.target.value); fetchColorSuggestions(); }}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {roomTypes.map((room) => (
                          <option key={room.value} value={room.value}>{room.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Style / Mood</label>
                      <select
                        value={selectedMood}
                        onChange={(e) => { setSelectedMood(e.target.value); fetchColorSuggestions(); }}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {moods.map((mood) => (
                          <option key={mood.value} value={mood.value}>{mood.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Color Suggestions */}
                  {colorSuggestions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Suggested Colors (click to add)</label>
                      <div className="flex flex-wrap gap-2">
                        {colorSuggestions.map((color, index) => {
                          const hexMatch = color.match(/#[A-Fa-f0-9]{6}/);
                          const hex = hexMatch ? hexMatch[0] : "#888888";
                          const name = color.split(" ")[0];
                          return (
                            <button
                              key={index}
                              onClick={() => addColorToPrompt(color)}
                              className="flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:border-accent transition-colors"
                            >
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: hex }} />
                              <span className="text-sm">{name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Describe Your Vision *</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g., Light blue walls with white trim, modern minimalist style, large windows with natural light, wooden floors..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["white walls", "natural light", "modern style", "wooden floors"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setPrompt((prev) => prev ? `${prev}, ${tag}` : tag)}
                          className="text-xs px-3 py-1 rounded-full bg-secondary hover:bg-accent/20 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Room Photo (Optional)</label>
                    {uploadedImage ? (
                      <div className="relative rounded-lg overflow-hidden">
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-40 object-cover" />
                        <button
                          onClick={removeUploadedImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload (PNG, JPG up to 10MB)</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-6 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating... (20-30 seconds)
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Visualization
                      </>
                    )}
                  </Button>

                  {estimatedTime && (
                    <p className="text-sm text-center text-amber-600 bg-amber-50 rounded-lg p-3">
                      AI model is loading. Please wait ~{estimatedTime} seconds and try again.
                    </p>
                  )}

                  {/* Result */}
                  {generatedImage && (
                    <div className="mt-8 pt-8 border-t border-border">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-4">Your Visualization</h3>
                      <div className="rounded-lg overflow-hidden mb-4">
                        <img src={generatedImage} alt="Generated visualization" className="w-full" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={handleGenerate} variant="outline" className="flex-1">
                          <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                        </Button>
                        <Button onClick={handleDownload} variant="outline" className="flex-1">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                        <Button onClick={handleSaveDesign} disabled={isSaving || !user} className="flex-1">
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {user ? "Save" : "Login to Save"}
                        </Button>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 p-6 bg-accent/10 rounded-lg text-center">
                        <p className="font-semibold text-foreground mb-3">Love this design? Let's make it real!</p>
                        <Link to="/quote">
                          <Button className="btn-primary">
                            Get a Free Quote <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RoomVisualizer;
