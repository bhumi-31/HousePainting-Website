import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const locations = [
    { name: "Brampton", slug: "brampton" },
    { name: "Caledon", slug: "caledon" },
    { name: "Milton", slug: "milton" },
    { name: "Niagara", slug: "niagara" },
    { name: "Kitchener", slug: "kitchener" },
];

const LocationsSection = () => {
    return (
        <section className="py-20 bg-primary">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-primary-foreground mb-4">
                        <span className="text-accent">Locations</span> We Serve
                    </h2>
                    <p className="text-primary-foreground/70 max-w-2xl mx-auto">
                        Professional house painting services across Ontario, Canada
                    </p>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {locations.map((location, index) => (
                        <Link
                            key={location.slug}
                            to={`/services?location=${location.slug}`}
                            className="group relative bg-primary-foreground/5 hover:bg-accent border border-primary-foreground/10 hover:border-accent rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-accent/20 group-hover:bg-primary-foreground/20 rounded-full flex items-center justify-center transition-colors duration-300">
                                    <MapPin className="w-6 h-6 text-accent group-hover:text-primary-foreground transition-colors duration-300" />
                                </div>
                                <h3 className="text-lg font-heading font-bold text-primary-foreground group-hover:text-primary-foreground transition-colors duration-300">
                                    {location.name}
                                </h3>
                                <p className="text-sm text-primary-foreground/60 group-hover:text-primary-foreground/80 transition-colors duration-300">
                                    House Painting
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom text */}
                <div className="text-center mt-10">
                    <p className="text-primary-foreground/70">
                        Don't see your location?{" "}
                        <Link to="/contact" className="text-accent hover:underline font-semibold">
                            Contact us
                        </Link>{" "}
                        - we may still be able to help!
                    </p>
                </div>
            </div>
        </section>
    );
};

export default LocationsSection;
