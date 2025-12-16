import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, Filter } from "lucide-react";
import Layout from "../components/layout/Layout";
import InstagramSection from "../components/home/InstagramSection";
import { Button, ProjectCardSkeleton } from "../components/ui/index";
import { portfolioApi } from "../lib/api";
import exteriorImage from "../assets/exterior-painting.jpg";
import interiorImage from "../assets/interior-painting.jpg";
import deckImage from "../assets/deck-painting.jpg";
import heroImage from "../assets/hero-painting.jpg";

const roomTypes = [
  { value: "", label: "All Rooms" },
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "exterior", label: "Exterior" },
  { value: "commercial", label: "Commercial" },
];

const defaultProjects = [
  {
    _id: "1",
    title: "Modern Living Room Makeover",
    location: "Downtown",
    beforeImage: heroImage,
    afterImage: interiorImage,
    roomType: "living_room",
    colors: ["Soft Gray", "White"],
    views: 245,
  },
  {
    _id: "2",
    title: "Exterior Home Transformation",
    location: "Suburbs",
    beforeImage: heroImage,
    afterImage: exteriorImage,
    roomType: "exterior",
    colors: ["Cream", "Brown"],
    views: 189,
  },
  {
    _id: "3",
    title: "Deck Restoration Project",
    location: "Lakeside",
    beforeImage: heroImage,
    afterImage: deckImage,
    roomType: "exterior",
    colors: ["Natural Wood", "Mahogany"],
    views: 156,
  },
  {
    _id: "4",
    title: "Commercial Office Space",
    location: "Business District",
    beforeImage: heroImage,
    afterImage: interiorImage,
    roomType: "commercial",
    colors: ["White", "Blue Accent"],
    views: 312,
  },
];

const Portfolio = () => {
  const [projects, setProjects] = useState(defaultProjects);
  const [loading, setLoading] = useState(false);
  const [roomFilter, setRoomFilter] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [roomFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roomFilter) params.roomType = roomFilter;

      const response = await portfolioApi.getAll(params);
      if (response.projects && response.projects.length > 0) {
        setProjects(response.projects);
      }
    } catch (error) {
      console.log("Using default projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-primary">
        <div className="absolute inset-0">
          <img src={exteriorImage} alt="Portfolio" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-foreground mb-4">
            OUR PORTFOLIO
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Browse our completed projects and see the transformations we've created
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container-custom">
          <div className="flex gap-2 flex-wrap justify-center">
            {roomTypes.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setRoomFilter(filter.value)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${roomFilter === filter.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-foreground hover:bg-accent/20"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Link
                  to={`/portfolio/${project._id}`}
                  key={project._id}
                  className="group cursor-pointer"
                >
                  <div className="bg-card rounded-2xl overflow-hidden shadow-lg card-hover border border-border">
                    {/* Before/After Comparison with Hover Effect */}
                    <div className="relative h-64 overflow-hidden cursor-pointer">
                      {/* After Image (default) */}
                      <img
                        src={project.afterImage || exteriorImage}
                        alt={`${project.title} - After`}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                      />
                      {/* Before Image (on hover) */}
                      <img
                        src={project.beforeImage || heroImage}
                        alt={`${project.title} - Before`}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                      />
                      {/* Labels */}
                      <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold transition-opacity duration-300 group-hover:opacity-0">
                        After
                      </div>
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        Before
                      </div>
                      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {project.viewCount || project.views || 0}
                      </div>
                      {/* Hover Instruction */}
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-background/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-full text-sm font-medium">
                          Hover to see transformation
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">{project.location}</p>
                      <div className="flex gap-2 mb-4">
                        {project.colors?.map((color) => (
                          <span
                            key={color}
                            className="px-3 py-1 bg-secondary text-xs rounded-full"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                      <Button className="w-full btn-primary">
                        View Details
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Instagram Reels Section */}
      <InstagramSection variant="portfolio" />

      {/* CTA */}
      <section className="section-padding bg-accent">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-accent-foreground mb-4">
            Want Results Like These?
          </h2>
          <p className="text-accent-foreground/80 mb-8 max-w-xl mx-auto">
            Let us transform your space too! Get a free quote today.
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

export default Portfolio;
