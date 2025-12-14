import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-accent">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-accent-foreground mb-4">
              Ready to Transform Your Space?
            </h2>
            <p className="text-accent-foreground/80 text-lg max-w-xl">
              Contact us today for a free estimate. Let our experts help you choose the perfect colors and bring your vision to life.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/quote">
              <button className="bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-md transition-all duration-300 hover:shadow-lg hover:bg-primary/90 inline-flex items-center">
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
            <a
              href="tel:1-800-555-0123"
              className="bg-accent-foreground text-accent font-semibold px-8 py-4 rounded-md transition-all duration-300 hover:shadow-lg inline-flex items-center justify-center"
            >
              <Phone className="mr-2 w-5 h-5" />
              1-800-555-0123
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
