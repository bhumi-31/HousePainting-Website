import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Filter, Paintbrush, Home, Building2, Palette, Star } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button, Input, ServiceCardSkeleton } from "../components/ui/index";
import { servicesApi } from "../lib/api";
import heroImage from "../assets/hero-painting.jpg";
import exteriorImage from "../assets/exterior-painting.jpg";
import interiorImage from "../assets/interior-painting.jpg";
import deckImage from "../assets/deck-painting.jpg";

const categoryFilters = [
  { value: "", label: "All Services" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

const defaultServices = [
  {
    _id: "1",
    name: "Interior Painting",
    description: "Transform your indoor spaces with our professional interior painting services. We handle walls, ceilings, trim, and more.",
    estimatedTimeline: "2-5 days",
    images: [interiorImage],
    features: ["Wall Preparation", "Premium Paint", "Clean Finish", "Color Consultation"],
    category: "residential",
  },
  {
    _id: "2",
    name: "Exterior Painting",
    description: "Protect and beautify your home's exterior with durable, weather-resistant paint that lasts for years.",
    estimatedTimeline: "3-7 days",
    images: [exteriorImage],
    features: ["Pressure Washing", "Surface Prep", "Weather-Resistant Paint", "Trim Work"],
    category: "residential",
  },
  {
    _id: "3",
    name: "Deck & Fence Staining",
    description: "Revitalize your outdoor wooden structures with professional staining and sealing services.",
    estimatedTimeline: "1-3 days",
    images: [deckImage],
    features: ["Power Washing", "Sanding", "Premium Stain", "UV Protection"],
    category: "residential",
  },
  {
    _id: "4",
    name: "Commercial Painting",
    description: "Professional painting solutions for offices, retail spaces, and commercial buildings with minimal disruption.",
    estimatedTimeline: "1-3 weeks",
    images: [heroImage],
    features: ["Flexible Scheduling", "Large Scale Projects", "Safety Compliant", "Quick Turnaround"],
    category: "commercial",
  },
  {
    _id: "5",
    name: "Cabinet Painting",
    description: "Give your kitchen or bathroom a fresh new look with our professional cabinet painting and refinishing services.",
    estimatedTimeline: "3-5 days",
    images: [interiorImage],
    features: ["Surface Prep", "Primer Application", "Durable Finish", "Hardware Reinstall"],
    category: "residential",
  },
  {
    _id: "6",
    name: "Drywall Repair",
    description: "Expert drywall repair services including patching holes, fixing cracks, and texture matching for seamless results.",
    estimatedTimeline: "1-2 days",
    images: [interiorImage],
    features: ["Hole Patching", "Crack Repair", "Texture Matching", "Smooth Finish"],
    category: "residential",
  },
];

const Services = () => {
  const [services, setServices] = useState(defaultServices);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchServices();
  }, [category, search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = { isActive: 'true' };
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await servicesApi.getAll(params);
      if (response.services && response.services.length > 0) {
        setServices(response.services);
      }
    } catch (error) {
      console.log("Using default services");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 bg-primary">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Painting services" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-foreground mb-4">
            PAINTING SERVICES
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Professional painting solutions for residential and commercial properties
          </p>
          <Link to="/quote">
            <Button className="btn-primary text-lg px-8 py-6">
              Request Free Estimate
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCategory(filter.value)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    category === filter.value
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-foreground hover:bg-accent/20"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service._id}
                className="group bg-card rounded-2xl overflow-hidden shadow-lg card-hover border border-border"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.images?.[0] || exteriorImage}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    {service.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.features?.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-secondary text-xs rounded-full text-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                    {service.features?.length > 3 && (
                      <span className="px-2 py-1 bg-secondary text-xs rounded-full text-muted-foreground">
                        +{service.features.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Timeline</p>
                      <p className="text-sm font-heading font-bold text-accent">
                        {service.estimatedTimeline || service.duration || "Varies"}
                      </p>
                    </div>
                    <Link to={`/services/${service._id}`}>
                      <Button className="btn-primary text-sm px-4 py-2">
                        Learn More
                        <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-accent">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-accent-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-accent-foreground/80 mb-8 max-w-xl mx-auto">
            Request a free quote today and let us transform your space with professional painting services.
          </p>
          <Link to="/quote">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
              Get Your Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
