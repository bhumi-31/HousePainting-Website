import { Link } from "react-router-dom";
import { ArrowRight, Paintbrush, Home, Building2, Palette, CheckCircle } from "lucide-react";
import exteriorImage from "../../assets/exterior-painting.jpg";
import interiorImage from "../../assets/interior-painting.jpg";
import deckImage from "../../assets/deck-painting.jpg";

const services = [
  {
    icon: Home,
    title: "Exterior Painting",
    description: "Professional exterior house painting. We paint homes and businesses of all sizes with quality that lasts.",
    image: exteriorImage,
    features: ["Weather-resistant paints", "Surface preparation", "Color consultation"],
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Paintbrush,
    title: "Interior Painting",
    description: "Transform your interior spaces with expert wall, ceiling, and trim painting services.",
    image: interiorImage,
    features: ["Low-VOC options", "Furniture protection", "Clean finish"],
    color: "from-accent to-red-600",
  },
  {
    icon: Palette,
    title: "Deck & Fence",
    description: "Protect and beautify your outdoor wood surfaces with professional staining and painting.",
    image: deckImage,
    features: ["Wood preservation", "UV protection", "Custom staining"],
    color: "from-emerald-500 to-emerald-600",
  },
];

const ServicesSection = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            <Paintbrush className="w-4 h-4" />
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            We Provide Awesome <span className="text-accent">Painting Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From interior walls to exterior facades, we deliver exceptional painting services that transform your spaces.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link
              to="/services"
              key={service.title}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Floating Icon */}
                <div className={`absolute top-4 right-4 w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title on Image */}
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="text-2xl font-heading font-bold text-white">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-5 leading-relaxed">{service.description}</p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <span className="inline-flex items-center gap-2 text-accent font-semibold group/link hover:gap-3 transition-all">
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-14">
          <Link to="/services">
            <button className="btn-primary inline-flex items-center px-8 py-4 text-lg shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all">
              View All Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
