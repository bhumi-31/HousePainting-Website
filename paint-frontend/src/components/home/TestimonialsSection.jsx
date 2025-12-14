import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { reviewsApi } from "../../lib/api";

const defaultTestimonials = [
  {
    _id: "1",
    user: { name: "Sarah Johnson" },
    rating: 5,
    text: "Absolutely amazing work! The team was professional, punctual, and the finished result exceeded my expectations. Our living room looks brand new!",
  },
  {
    _id: "2",
    user: { name: "Michael Chen" },
    rating: 5,
    text: "We hired them for our office renovation and couldn't be happier. They worked around our schedule and delivered exceptional quality.",
  },
  {
    _id: "3",
    user: { name: "Emily Rodriguez" },
    rating: 5,
    text: "From the free estimate to the final coat, the entire experience was seamless. Highly recommend their exterior painting services!",
  },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [stats, setStats] = useState({ averageRating: "4.9", totalReviews: 150 });

  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await reviewsApi.getAll({ approved: true, limit: 6, sort: 'rating-high' });
      if (response.reviews && response.reviews.length > 0) {
        setTestimonials(response.reviews.slice(0, 3));
      }
    } catch (error) {
      console.log("Using default testimonials");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewsApi.getStats();
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.log("Using default stats");
    }
  };

  return (
    <section className="section-padding bg-primary">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mt-2 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-6">
            Don't just take our word for it. Here's what our satisfied customers have to say about our services.
          </p>
          
          {/* Overall Rating Badge */}
          <div className="inline-flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-heading font-bold text-accent">{stats.averageRating}</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(Number(stats.averageRating))
                        ? "fill-accent text-accent"
                        : "text-primary-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-px h-8 bg-primary-foreground/20" />
            <span className="text-primary-foreground/80">
              <strong className="text-primary-foreground">{stats.totalReviews}+</strong> Happy Customers
            </span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial._id}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="w-12 h-12 text-accent/30 absolute top-6 right-6" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Title */}
              {testimonial.title && (
                <h4 className="font-semibold text-primary-foreground mb-2">{testimonial.title}</h4>
              )}

              {/* Text */}
              <p className="text-primary-foreground/90 mb-6 leading-relaxed line-clamp-4">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">
                    {testimonial.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-primary-foreground">{testimonial.user?.name || "Customer"}</p>
                  <p className="text-sm text-primary-foreground/60">Verified Customer</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link 
            to="/reviews" 
            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
          >
            View All Reviews
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
