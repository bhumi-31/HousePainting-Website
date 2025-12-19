import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Wand2, Upload, Palette, Download, Save, Sparkles, RefreshCw, Image, Loader2, X, ArrowRight, Phone, Mail, CheckCircle, Camera } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button, Input, useToast } from "../components/ui/index";
import { aiApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import heroImage from "../assets/hero-painting.jpg";

// Popular paint colors for quick selection - prompts optimized for wall-only changes
const paintColors = [
  { name: "Warm White", hex: "#FAF7F2", prompt: "repaint walls warm white color" },
  { name: "Light Grey", hex: "#D3D3D3", prompt: "repaint walls light grey color" },
  { name: "Soft Beige", hex: "#E8DCC4", prompt: "repaint walls soft beige color" },
  { name: "Sky Blue", hex: "#87CEEB", prompt: "repaint walls light sky blue color" },
  { name: "Sage Green", hex: "#B2BEB5", prompt: "repaint walls sage green color" },
  { name: "Blush Pink", hex: "#F4C2C2", prompt: "repaint walls soft blush pink color" },
  { name: "Navy Blue", hex: "#1E3A5F", prompt: "repaint walls deep navy blue color" },
  { name: "Charcoal", hex: "#36454F", prompt: "repaint walls charcoal grey color" },
  { name: "Terracotta", hex: "#C96847", prompt: "repaint walls warm terracotta color" },
  { name: "Lavender", hex: "#B8A9C9", prompt: "repaint walls soft lavender color" },
  { name: "Olive Green", hex: "#708238", prompt: "repaint walls olive green color" },
  { name: "Cream Yellow", hex: "#FFFDD0", prompt: "repaint walls cream yellow color" },
];

const RoomVisualizer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
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
    setGeneratedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast({ title: "Photo required", description: "Please upload a photo of your room first", variant: "destructive" });
      return;
    }

    if (!selectedColor) {
      toast({ title: "Color required", description: "Please select a wall color", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setEstimatedTime(null);

    // Build prompt: selected color + any additional details
    const prompt = additionalDetails
      ? `${selectedColor.prompt}, ${additionalDetails}`
      : selectedColor.prompt;

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
      await aiApi.saveDesign(generatedImage, selectedColor?.prompt || "", "room");
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 bg-primary">
        <div className="absolute inset-0">
          <img src={heroImage} alt="AI Room Visualizer" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-foreground mb-4">
            AI ROOM VISUALIZER
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Upload your room photo and see how it looks with different paint colors!
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>Upload Any Room</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>Choose Paint Color</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>See Instant Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Column - How It Works */}
            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">How It Works</h2>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Upload Your Room Photo</h3>
                    <p className="text-sm text-muted-foreground">Take a clear photo of your room and upload it</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Choose Paint Color</h3>
                    <p className="text-sm text-muted-foreground">Select the wall color you want to try</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-foreground">See Your Room Transformed</h3>
                    <p className="text-sm text-muted-foreground">AI generates your room with new paint colors</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-secondary/50 rounded-2xl p-6 mt-8">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Photo Tips
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Take photo in good lighting
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Show walls clearly in the frame
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Capture the room from a corner for best view
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    Keep the photo straight and level
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

                {/* Step 1: Upload Photo */}
                <div className="mb-8">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    Upload Your Room Photo
                  </h2>
                  <p className="text-muted-foreground mb-4">Take a photo of your room and upload it here</p>

                  {uploadedImage ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-accent">
                      <img src={uploadedImage} alt="Your Room" className="w-full h-64 object-cover" />
                      <button
                        onClick={removeUploadedImage}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Photo uploaded!
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-accent/50 rounded-xl p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
                    >
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-accent" />
                      </div>
                      <p className="text-lg font-medium text-foreground mb-2">Click to upload your room photo</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                {/* Step 2: Choose Paint Color */}
                <div className="mb-8">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    Choose Wall Paint Color
                  </h2>
                  <p className="text-muted-foreground mb-4">Select the color you want to see on your walls</p>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {paintColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorSelect(color)}
                        className={`group relative p-3 rounded-xl border-2 transition-all ${selectedColor?.name === color.name
                          ? 'border-accent ring-2 ring-accent ring-offset-2'
                          : 'border-border hover:border-accent/50'
                          }`}
                      >
                        <div
                          className="w-full aspect-square rounded-lg mb-2 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-xs font-medium text-center truncate">{color.name}</p>
                        {selectedColor?.name === color.name && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-accent-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Additional Details (Optional) */}
                <div className="mb-8">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary text-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    Additional Details
                    <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                  </h2>
                  <p className="text-muted-foreground mb-4">Add any extra styling preferences</p>

                  <input
                    type="text"
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="e.g., modern style, white trim, natural lighting..."
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />

                  {/* Quick add tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["modern style", "white trim", "natural light", "matte finish", "accent wall"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setAdditionalDetails((prev) => prev ? `${prev}, ${tag}` : tag)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent/20 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !uploadedImage || !selectedColor}
                  className="w-full py-6 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Room... (20-30 seconds)
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      {!uploadedImage ? "Upload Photo First" : !selectedColor ? "Select a Color" : "See Your Room with New Paint!"}
                    </>
                  )}
                </Button>

                {estimatedTime && (
                  <p className="text-sm text-center text-amber-600 bg-amber-50 rounded-lg p-3 mt-4">
                    AI model is loading. Please wait ~{estimatedTime} seconds and try again.
                  </p>
                )}

                {/* Result - Before/After Comparison */}
                {generatedImage && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Your Room Transformation
                    </h3>

                    {/* Before/After Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="relative rounded-xl overflow-hidden">
                        <img src={uploadedImage} alt="Original Room" className="w-full h-64 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white font-semibold">Before</p>
                        </div>
                      </div>
                      <div className="relative rounded-xl overflow-hidden">
                        <img src={generatedImage} alt="Transformed Room" className="w-full h-64 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white font-semibold">After - {selectedColor?.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleGenerate} variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" /> Try Again
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
                    <div className="mt-6 p-6 bg-accent/10 rounded-xl text-center">
                      <p className="font-semibold text-foreground mb-3">Love this look? Let's make it real!</p>
                      <Link to="/quote">
                        <Button className="btn-primary">
                          Get a Free Painting Quote <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RoomVisualizer;
