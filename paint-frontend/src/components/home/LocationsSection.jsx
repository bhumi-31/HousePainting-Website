import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const locations = [
    { name: "Toronto", postalCode: "M5A" },
    { name: "Mississauga", postalCode: "L5A" },
    { name: "Brampton", postalCode: "L6P" },
    { name: "Oshawa", postalCode: "L1G" },
    { name: "Richmond Hill", postalCode: "L4B" },
    { name: "Vaughan", postalCode: "L4H" },
    { name: "Markham", postalCode: "L3P" },
    { name: "Oakville", postalCode: "L6H" },
    { name: "Hamilton", postalCode: "L8P" },
    { name: "London", postalCode: "N6A" },
    { name: "Barrie", postalCode: "L4M" },
    { name: "Caledon", postalCode: "L7C" },
    { name: "Milton", postalCode: "L9T" },
    { name: "Niagara", postalCode: "L2E" },
    { name: "Kitchener", postalCode: "N2G" },
];

const LocationsSection = () => {
    return (
        <section className="py-24 bg-[#1a1a2e]">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
                        <span className="text-white">Locations in </span>
                        <span className="text-accent italic">Canada</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Professional house painting services across Ontario
                    </p>
                </div>

                {/* Ontario Section */}
                <div className="bg-[#252538] rounded-2xl p-8 border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-red-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">+</span>
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-white">ONTARIO</h3>
                    </div>

                    {/* Locations Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {locations.map((location, index) => (
                            <Link
                                key={location.name}
                                to={`/services?location=${location.name.toLowerCase().replace(' ', '-')}`}
                                className="group bg-[#1a1a2e] hover:bg-accent border border-gray-600 hover:border-accent rounded-lg p-4 transition-all duration-300 transform hover:scale-105"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-accent group-hover:text-white" />
                                    <span className="text-white font-medium text-sm group-hover:text-white">
                                        {location.name}
                                    </span>
                                </div>
                                <span className="text-gray-500 text-xs group-hover:text-white/70">
                                    {location.postalCode}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* All Locations Link */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 text-accent hover:text-white transition-colors"
                        >
                            <span>All locations in Ontario</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Bottom text */}
                <div className="text-center mt-10">
                    <p className="text-gray-400">
                        Don't see your area?{" "}
                        <Link to="/contact" className="text-accent hover:underline font-semibold">
                            Contact us
                        </Link>{" "}
                        - we serve all of Ontario!
                    </p>
                </div>
            </div>
        </section>
    );
};

export default LocationsSection;
