import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Phone, MapPin, CheckCircle, XCircle, Star, Shield, Clock } from "lucide-react";
import { Button } from "../ui/index";
import heroImage from "../../assets/hero-painting.jpg";

// Service area postal code prefixes
const SERVICE_AREAS = {
  // GTA (Greater Toronto Area)
  'M': 'Greater Toronto Area',
  'L1': 'Greater Toronto Area',
  'L3': 'Greater Toronto Area',
  'L4': 'Greater Toronto Area',
  'L5': 'Greater Toronto Area',
  'L6': 'Greater Toronto Area',
  'L7': 'Greater Toronto Area',
  // Waterloo Region
  'N1': 'Waterloo Region',
  'N2': 'Waterloo Region',
  'N3': 'Waterloo Region',
  // Niagara Region
  'L0S': 'Niagara Region',
  'L2': 'Niagara Region',
  'L3A': 'Niagara Region',
  'L3B': 'Niagara Region',
  'L3C': 'Niagara Region',
  'L3K': 'Niagara Region',
  'L3M': 'Niagara Region',
  // Mono / Barrie
  'L4M': 'Barrie',
  'L4N': 'Barrie',
  'L9V': 'Mono',
  'L9W': 'Orangeville',
};

const checkPostalCode = (postalCode) => {
  const cleaned = postalCode.toUpperCase().replace(/\s/g, '');
  
  // Check 3-character prefixes first (more specific)
  const prefix3 = cleaned.substring(0, 3);
  if (SERVICE_AREAS[prefix3]) {
    return { valid: true, area: SERVICE_AREAS[prefix3] };
  }
  
  // Check 2-character prefixes
  const prefix2 = cleaned.substring(0, 2);
  if (SERVICE_AREAS[prefix2]) {
    return { valid: true, area: SERVICE_AREAS[prefix2] };
  }
  
  // Check 1-character prefix (for Toronto 'M')
  const prefix1 = cleaned.substring(0, 1);
  if (SERVICE_AREAS[prefix1]) {
    return { valid: true, area: SERVICE_AREAS[prefix1] };
  }
  
  return { valid: false, area: null };
};

const HeroSection = () => {
  const [postalCode, setPostalCode] = useState('');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postalCode.trim()) return;
    
    const checkResult = checkPostalCode(postalCode);
    setResult(checkResult);
    
    if (checkResult.valid) {
      // Wait a moment to show success, then navigate
      setTimeout(() => {
        navigate('/quote', { state: { postalCode: postalCode.toUpperCase() } });
      }, 1500);
    }
  };

  const handleInputChange = (e) => {
    setPostalCode(e.target.value);
    setResult(null); // Clear result when typing
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional house painting services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/40" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Content - Shifted Left */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl ml-0 lg:ml-8 xl:ml-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/30 text-accent rounded-full text-sm font-semibold mb-6 animate-fade-up">
            <Star className="w-4 h-4 fill-accent" />
            2+ Years of Excellence
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-black leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-white">PROFESSIONAL</span>
            <br />
            <span className="text-accent">HOUSE PAINTING</span>
            <br />
            <span className="text-white">SERVICES</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl animate-fade-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Transform your home with our expert painting services. Quality craftsmanship, attention to detail, and customer satisfaction guaranteed.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 mb-8 animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center gap-2 text-gray-300">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">Fully Insured</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-sm">On-Time Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="text-sm">5-Star Rated</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/services">
              <Button className="btn-primary text-lg px-8 py-6 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow">
                View Our Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/quote">
              <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6 transition-all">
                Request Free Quote
              </Button>
            </Link>
          </div>

          {/* Quick Contact */}
          <div className="mt-12 flex items-center gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-accent/30">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Call for Free Estimate</p>
              <a href="tel:1-800-555-0123" className="text-2xl font-heading font-bold text-white hover:text-accent transition-colors">
                705-951-0764
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Service Request Card - Postal Code Checker */}
      <div className="hidden xl:block absolute right-12 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 animate-slide-in-right border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-gray-900">Service Request</h3>
          </div>
          <p className="text-gray-500 mb-6 ml-13">Let Us Help You!</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Postal Code"
                value={postalCode}
                onChange={handleInputChange}
                maxLength={7}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-accent focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              />
            </div>
            
            {/* Result Message */}
            {result && (
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                result.valid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {result.valid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium">Great news!</p>
                      <p className="text-green-700 text-sm">We service {result.area}. Redirecting to quote form...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">Sorry!</p>
                      <p className="text-red-700 text-sm">We currently don't service this area. We serve GTA, Waterloo, Niagara, and Barrie regions.</p>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full bg-[#0a1628] hover:bg-[#162544] text-white py-4 text-lg rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl">
              <span className="mr-2">—</span>
              Request A Free Estimate
              <span className="ml-2">—</span>
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Serving GTA, Waterloo, Niagara & Barrie regions
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-1 mt-4">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-sm text-gray-600 ml-2">500+ Happy Customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
