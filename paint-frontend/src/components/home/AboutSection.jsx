import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import interiorImage from "../../assets/interior-painting.jpg";

const features = [
  "2+ Years of Professional Experience",
  "Licensed and Insured Contractors",
  "Premium Quality Materials",
  "Customer Satisfaction Guaranteed",
  "Free Color Consultation",
  "Competitive Pricing",
];

const AboutSection = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative animate-slide-in-left">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={interiorImage}
                alt="Beautiful interior painting result"
                className="w-full h-[500px] object-cover"
              />
            </div>
            {/* Stats Badge */}
            <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground rounded-2xl p-6 shadow-xl">
              <p className="text-5xl font-heading font-black">2+</p>
              <p className="text-sm font-semibold">Years Experience</p>
            </div>
          </div>

          {/* Content */}
          <div className="animate-slide-in-right">
            <span className="text-accent font-semibold uppercase tracking-wider">About Us</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-2 mb-6">
              We Are Your Premier Painting Contractors
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              With over 2 years of experience, we've built a reputation for excellence in residential and commercial painting services. Our team of skilled professionals is committed to delivering exceptional results that exceed your expectations.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/quote">
              <button className="btn-primary inline-flex items-center">
                Request Free Quote Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
