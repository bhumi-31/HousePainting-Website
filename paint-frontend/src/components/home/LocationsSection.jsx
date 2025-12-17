import { useState } from "react";
import { MapPin, ArrowRight, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

// Locations data with postal codes (for search validation) - not displayed
const locations = [
    { name: "Toronto", postalCodes: ["M5A", "M5B", "M4W", "M6K"] },
    { name: "Mississauga", postalCodes: ["L5A", "L5B", "L5C", "L5G"] },
    { name: "Brampton", postalCodes: ["L6P", "L6R", "L6S", "L6T"] },
    { name: "Oshawa", postalCodes: ["L1G", "L1H", "L1J", "L1K"] },
    { name: "Richmond Hill", postalCodes: ["L4B", "L4C", "L4E", "L4S"] },
    { name: "Vaughan", postalCodes: ["L4H", "L4K", "L4L", "L6A"] },
    { name: "Markham", postalCodes: ["L3P", "L3R", "L3S", "L3T"] },
    { name: "Oakville", postalCodes: ["L6H", "L6J", "L6K", "L6L"] },
    { name: "Hamilton", postalCodes: ["L8P", "L8R", "L8S", "L8T"] },
    { name: "London", postalCodes: ["N6A", "N6B", "N6C", "N6E"] },
    { name: "Barrie", postalCodes: ["L4M", "L4N", "L9J", "L9S"] },
    { name: "Caledon", postalCodes: ["L7C", "L7E", "L7K"] },
    { name: "Milton", postalCodes: ["L9T", "L9E"] },
    { name: "Niagara", postalCodes: ["L2E", "L2G", "L2H", "L2M"] },
    { name: "Kitchener", postalCodes: ["N2G", "N2H", "N2M", "N2N"] },
];

const LocationsSection = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
                        <MapPin className="w-4 h-4" />
                        Service Areas
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
                        Locations in <span className="text-accent">Ontario</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Professional house painting services across Ontario, Canada
                    </p>
                </div>

                {/* Collapsible Ontario Box */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header with + button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-heading font-bold text-foreground">ONTARIO</h3>
                                    <p className="text-sm text-muted-foreground">{locations.length} locations</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                                {isExpanded ? (
                                    <Minus className="w-5 h-5 text-accent" />
                                ) : (
                                    <Plus className="w-5 h-5 text-accent" />
                                )}
                            </div>
                        </button>

                        {/* Expandable Locations List */}
                        <div
                            className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="p-6 pt-0 border-t border-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                                    {locations.map((location) => (
                                        <Link
                                            key={location.name}
                                            to={`/services?location=${location.name.toLowerCase().replace(' ', '-')}`}
                                            className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/5 hover:text-accent transition-colors group"
                                        >
                                            <MapPin className="w-4 h-4 text-accent" />
                                            <span className="font-medium text-foreground group-hover:text-accent">
                                                {location.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-14">
                    <p className="text-muted-foreground mb-6">
                        Don't see your area? We serve all of Ontario!
                    </p>
                    <Link to="/contact">
                        <button className="btn-primary inline-flex items-center px-8 py-4 text-lg shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all">
                            Contact Us
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LocationsSection;
