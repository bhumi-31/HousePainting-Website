import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Button, Input, Textarea, Checkbox, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/index";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Calculator, Lock, MapPin, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import heroImage from "../assets/hero-painting.jpg";
import { useAuth } from "../context/AuthContext";
import { quotesApi } from "../lib/api";

// Serviceable postal code prefixes (first 3 characters - FSA codes)
// These are areas around Barrie/Ontario where service is available
const serviceablePostalCodes = [
  // Barrie area
  "L4M", "L4N", "L9X", "L9Y",
  // Orillia
  "L3V",
  // Innisfil
  "L9S",
  // Bradford
  "L3Z",
  // Newmarket
  "L3X", "L3Y",
  // Aurora
  "L4G",
  // Richmond Hill
  "L4B", "L4C", "L4E", "L4S",
  // Markham
  "L3P", "L3R", "L3S", "L3T", "L6B", "L6C", "L6E", "L6G",
  // Toronto (GTA)
  "M1A", "M1B", "M1C", "M1E", "M1G", "M1H", "M1J", "M1K", "M1L", "M1M", "M1N", "M1P", "M1R", "M1S", "M1T", "M1V", "M1W", "M1X",
  "M2H", "M2J", "M2K", "M2L", "M2M", "M2N", "M2P", "M2R",
  "M3A", "M3B", "M3C", "M3H", "M3J", "M3K", "M3L", "M3M", "M3N",
  "M4A", "M4B", "M4C", "M4E", "M4G", "M4H", "M4J", "M4K", "M4L", "M4M", "M4N", "M4P", "M4R", "M4S", "M4T", "M4V", "M4W", "M4X", "M4Y",
  "M5A", "M5B", "M5C", "M5E", "M5G", "M5H", "M5J", "M5K", "M5L", "M5M", "M5N", "M5P", "M5R", "M5S", "M5T", "M5V", "M5W", "M5X",
  "M6A", "M6B", "M6C", "M6E", "M6G", "M6H", "M6J", "M6K", "M6L", "M6M", "M6N", "M6P", "M6R", "M6S",
  "M7A", "M7R", "M7Y",
  "M8V", "M8W", "M8X", "M8Y", "M8Z",
  "M9A", "M9B", "M9C", "M9L", "M9M", "M9N", "M9P", "M9R", "M9V", "M9W",
  // Mississauga
  "L4T", "L4V", "L4W", "L4X", "L4Y", "L4Z", "L5A", "L5B", "L5C", "L5E", "L5G", "L5H", "L5J", "L5K", "L5L", "L5M", "L5N", "L5P", "L5R", "L5S", "L5T", "L5V", "L5W",
  // Brampton
  "L6P", "L6R", "L6S", "L6T", "L6V", "L6W", "L6X", "L6Y", "L6Z", "L7A",
  // Vaughan
  "L4H", "L4J", "L4K", "L4L", "L6A",
  // Oakville/Burlington
  "L6H", "L6J", "L6K", "L6L", "L6M", "L7L", "L7M", "L7N", "L7P", "L7R", "L7S", "L7T",
];

const isPostalCodeServiceable = (postalCode) => {
  if (!postalCode || postalCode.length < 3) return null; // Not enough to check
  const fsa = postalCode.toUpperCase().replace(/\s/g, '').substring(0, 3);
  return serviceablePostalCodes.includes(fsa);
};

const serviceTypes = [
  { value: "interior_painting", label: "Interior Painting" },
  { value: "exterior_painting", label: "Exterior Painting" },
  { value: "deck_fence_staining", label: "Deck & Fence Staining" },
  { value: "commercial_painting", label: "Commercial Painting" },
  { value: "cabinet_painting", label: "Cabinet Painting" },
  { value: "drywall_repair", label: "Drywall Repair" },
];

const roomTypes = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "dining_room", label: "Dining Room" },
  { value: "office", label: "Office" },
  { value: "basement", label: "Basement" },
  { value: "exterior", label: "Exterior" },
  { value: "commercial", label: "Commercial Space" },
];

const paintQualities = [
  { value: "economy", label: "Economy", priceMultiplier: 0.8 },
  { value: "standard", label: "Standard", priceMultiplier: 1 },
  { value: "premium", label: "Premium", priceMultiplier: 1.2 },
  { value: "luxury", label: "Luxury", priceMultiplier: 1.5 },
];

const additionalServices = [
  { value: "ceiling_painting", label: "Ceiling Painting", price: 75 },
  { value: "trim_painting", label: "Trim & Baseboards", price: 50 },
  { value: "door_painting", label: "Door Painting", price: 35 },
  { value: "wall_preparation", label: "Wall Preparation & Repair", price: 80 },
  { value: "furniture_moving", label: "Furniture Moving", price: 40 },
  { value: "cleanup", label: "Professional Cleanup", price: 30 },
];

export default function Quote() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [postalCodeChecked, setPostalCodeChecked] = useState(false);
  const [isServiceable, setIsServiceable] = useState(null);
  const [formData, setFormData] = useState({
    serviceType: "",
    roomType: "",
    roomSize: "",
    postalCode: "",
    paintQuality: "standard",
    numberOfCoats: "2",
    additionalServices: [],
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    city: "",
    province: "",
    preferredStartDate: "",
    specialInstructions: "",
  });

  // Check postal code serviceability
  const handlePostalCodeChange = (value) => {
    const cleanedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Format as A1A 1A1
    let formatted = cleanedValue;
    if (cleanedValue.length > 3) {
      formatted = cleanedValue.substring(0, 3) + ' ' + cleanedValue.substring(3, 6);
    }
    setFormData(prev => ({ ...prev, postalCode: formatted }));
    
    if (cleanedValue.length >= 3) {
      const serviceable = isPostalCodeServiceable(cleanedValue);
      setIsServiceable(serviceable);
      setPostalCodeChecked(true);
    } else {
      setIsServiceable(null);
      setPostalCodeChecked(false);
    }
  };

  // Pre-fill postal code if passed from home page
  useEffect(() => {
    if (location.state?.postalCode) {
      handlePostalCodeChange(location.state.postalCode);
    }
  }, [location.state]);

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone
      }));
    }
  }, [user]);

  const calculateEstimate = () => {
    const basePrice = 5;
    const size = parseInt(formData.roomSize) || 0;
    const quality = paintQualities.find((q) => q.value === formData.paintQuality);
    const coats = parseInt(formData.numberOfCoats) || 2;
    
    let total = size * basePrice * (quality?.priceMultiplier || 1) * (coats / 2);
    
    formData.additionalServices.forEach((service) => {
      const found = additionalServices.find((s) => s.value === service);
      if (found) total += found.price;
    });

    return Math.round(total);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const quoteData = {
        serviceType: formData.serviceType,
        roomType: formData.roomType,
        roomSize: parseInt(formData.roomSize),
        paintQuality: formData.paintQuality,
        numberOfCoats: parseInt(formData.numberOfCoats),
        additionalServices: formData.additionalServices,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone.replace(/\D/g, ''),
        address: {
          street: formData.street,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode
        },
        preferredStartDate: formData.preferredStartDate || null,
        specialInstructions: formData.specialInstructions
      };

      await quotesApi.create(quoteData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Quote submission error:', error);
      toast.error(error.message || "Failed to submit quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdditionalService = (value) => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(value)
        ? prev.additionalServices.filter((s) => s !== value)
        : [...prev.additionalServices, value],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.serviceType && formData.roomType && formData.roomSize && formData.postalCode.length >= 6 && isServiceable === true;
      case 2:
        return formData.paintQuality;
      case 3:
        return formData.customerName && formData.customerEmail && formData.customerPhone;
      default:
        return true;
    }
  };

  const getSelectedLabel = (value, options) => {
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : "";
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-primary py-16 md:py-20">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Painting services" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-primary-foreground mb-4">
            Get Your Free Quote
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Complete the form below and receive an instant estimate. Our
            team will follow up with a detailed quote.
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="bg-muted py-6 border-b border-border">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-border text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <span
                  className={`hidden md:block text-sm font-medium ${
                    step >= s ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s === 1 && "Project Details"}
                  {s === 2 && "Options"}
                  {s === 3 && "Contact Info"}
                  {s === 4 && "Review"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Required Check */}
      {!isAuthenticated ? (
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Login Required
              </h2>
              <p className="text-muted-foreground mb-8">
                Please log in or create an account to request a free quote. This helps us keep track of your projects and provide you with the best service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login" state={{ from: '/quote' }}>
                  <Button className="btn-primary w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" state={{ from: '/quote' }}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Have questions? <a href="tel:7059510764" className="text-accent hover:underline">Call us directly</a>
              </p>
            </div>
          </div>
        </section>
      ) : isSubmitted ? (
        /* Success Message */
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Quote Request Submitted!
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Thank you for your interest in our services. We've received your quote request and will get back to you within 24 hours.
              </p>
              <div className="bg-muted/30 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <span>Our team will review your project details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <span>We'll contact you to schedule a free on-site consultation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <span>You'll receive a detailed quote within 24-48 hours</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button className="btn-primary w-full sm:w-auto">
                    Back to Home
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Explore Our Services
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Questions? Call us at <a href="tel:7059510764" className="text-accent hover:underline">705-951-0764</a>
              </p>
            </div>
          </div>
        </section>
      ) : (
      /* Form */
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Project Details */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Tell us about your project
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Service Type *
                  </label>
                  <Select
                    value={getSelectedLabel(formData.serviceType, serviceTypes)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, serviceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Room Type *
                  </label>
                  <Select
                    value={getSelectedLabel(formData.roomType, roomTypes)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, roomType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Room Size (sq ft) *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 200"
                    value={formData.roomSize}
                    onChange={(e) =>
                      setFormData({ ...formData, roomSize: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Measure length × width of the room
                  </p>
                </div>

                {/* Postal Code Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Postal Code *
                  </label>
                  <Input
                    placeholder="e.g., L4M 1A1"
                    value={formData.postalCode}
                    onChange={(e) => handlePostalCodeChange(e.target.value)}
                    maxLength={7}
                    className={postalCodeChecked ? (isServiceable ? 'border-green-500' : 'border-red-500') : ''}
                  />
                  
                  {/* Service availability feedback */}
                  {postalCodeChecked && isServiceable === true && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Great! We provide services in your area.</span>
                    </div>
                  )}
                  
                  {postalCodeChecked && isServiceable === false && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Service Not Available</p>
                          <p className="text-sm text-red-600 mt-1">
                            Sorry, we do not currently provide services in this area. We serve the Greater Toronto Area, Barrie, Orillia, and surrounding regions.
                          </p>
                          <p className="text-sm text-red-600 mt-2">
                            Please call us at <a href="tel:7059510764" className="font-medium underline">705-951-0764</a> to discuss your project.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!postalCodeChecked && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your postal code to check service availability
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Options */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Choose your options
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Paint Quality *
                  </label>
                  <Select
                    value={getSelectedLabel(formData.paintQuality, paintQualities)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paintQuality: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paintQualities.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Number of Coats
                  </label>
                  <Select
                    value={formData.numberOfCoats === "1" ? "1 Coat" : formData.numberOfCoats === "2" ? "2 Coats (Recommended)" : "3 Coats"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, numberOfCoats: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Coat</SelectItem>
                      <SelectItem value="2">2 Coats (Recommended)</SelectItem>
                      <SelectItem value="3">3 Coats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    Additional Services
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {additionalServices.map((service) => (
                      <label
                        key={service.value}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={formData.additionalServices.includes(
                            service.value
                          )}
                          onCheckedChange={() =>
                            toggleAdditionalService(service.value)
                          }
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {service.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            +${service.price}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Your contact information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, customerEmail: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone *
                    </label>
                    <Input
                      type="tel"
                      placeholder="(123) 456-7890"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Street Address
                    </label>
                    <Input
                      placeholder="123 Main Street"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City
                    </label>
                    <Input
                      placeholder="Toronto"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Province
                    </label>
                    <Input
                      placeholder="ON"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Review your quote
                </h2>

                <div className="bg-muted rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calculator className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Estimated Price
                      </p>
                      <p className="text-3xl font-heading font-black text-foreground">
                        ${calculateEstimate().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Type:</span>
                      <span className="font-medium text-foreground">
                        {serviceTypes.find((s) => s.value === formData.serviceType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Type:</span>
                      <span className="font-medium text-foreground">
                        {roomTypes.find((r) => r.value === formData.roomType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Size:</span>
                      <span className="font-medium text-foreground">
                        {formData.roomSize} sq ft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground">
                        {formData.postalCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paint Quality:</span>
                      <span className="font-medium text-foreground">
                        {paintQualities.find((q) => q.value === formData.paintQuality)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coats:</span>
                      <span className="font-medium text-foreground">
                        {formData.numberOfCoats}
                      </span>
                    </div>
                    {formData.additionalServices.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Additional Services:
                        </span>
                        <span className="font-medium text-foreground text-right">
                          {formData.additionalServices.length} selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border border-border">
                  <h3 className="font-heading font-bold text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {formData.customerName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {formData.customerEmail}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {formData.customerPhone}
                    </p>
                    {formData.street && (
                      <p>
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {formData.street}, {formData.city}, {formData.province}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Special Instructions (Optional)
                  </label>
                  <Textarea
                    placeholder="Any special requirements or notes..."
                    rows={4}
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialInstructions: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quote Request"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      )}
    </Layout>
  );
}