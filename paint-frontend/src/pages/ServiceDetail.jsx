import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button } from "../components/ui/index";
import { servicesApi } from "../lib/api";
import exteriorImage from "../assets/exterior-painting.jpg";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await servicesApi.getById(id);
      setService(response.service);
    } catch (error) {
      // Default service for demo
      setService({
        _id: id,
        name: "Professional Painting Service",
        description: "Transform your space with our expert painting services. We deliver quality craftsmanship and attention to detail.",
        estimatedTimeline: "2-5 days",
        images: [exteriorImage],
        features: ["Premium Materials", "Expert Painters", "Clean Work", "Satisfaction Guaranteed"],
        category: "residential",
      });
    } finally {
      setLoading(false);
    }
  };

  const images = service?.images?.length > 0 ? service.images : [exteriorImage];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-primary">
        <div className="absolute inset-0">
          <img
            src={service?.images?.[0] || exteriorImage}
            alt={service?.name}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container-custom">
          <Link to="/services" className="inline-flex items-center text-primary-foreground/80 hover:text-accent mb-4">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Services
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-primary-foreground mb-4">
            {service?.name}
          </h1>
          <span className="inline-block px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
            {service?.category}
          </span>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div 
                className="relative rounded-2xl overflow-hidden mb-4 bg-secondary cursor-pointer"
                onClick={() => setShowLightbox(true)}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={service?.name}
                  className="w-full max-h-[500px] object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${service?.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                About This Service
              </h2>
              <p className="text-muted-foreground text-lg mb-8 whitespace-pre-line">{service?.description}</p>

              <h3 className="text-xl font-heading font-bold text-foreground mb-4">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {service?.features?.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border sticky top-24">
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">Service Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Timeline</p>
                      <p className="font-semibold">
                        {service?.estimatedTimeline || "Contact for estimate"}
                      </p>
                    </div>
                  </div>
                </div>

                <Link to="/quote" className="block">
                  <Button className="w-full btn-primary">
                    Get Free Quote
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox for Full Image View */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-accent p-2"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-accent p-2"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          
          <img
            src={images[currentImageIndex]}
            alt={service?.name}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-accent p-2"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ServiceDetail;
