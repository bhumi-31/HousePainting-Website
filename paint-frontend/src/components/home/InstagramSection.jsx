import { useState } from "react";
import { Instagram } from "lucide-react";
import { Button } from "../ui/index";

// Instagram handle
const INSTAGRAM_HANDLE = "chandan_house_painting";

// Instagram post/reel URLs
const instagramPosts = [
  {
    id: 1,
    embedUrl: "https://www.instagram.com/p/DMovB2nNCiE/",
    caption: "Professional painting work"
  },
  {
    id: 2,
    embedUrl: "https://www.instagram.com/p/DMW2DNON7WF/",
    caption: "Room transformation"
  },
  {
    id: 3,
    embedUrl: "https://www.instagram.com/p/DKVbCWxt0GA/",
    caption: "Interior painting project"
  },
  {
    id: 4,
    embedUrl: "https://www.instagram.com/p/DGMs9jaNgag/",
    caption: "Before & after reveal"
  },
  {
    id: 5,
    embedUrl: "https://www.instagram.com/p/DF_Dt3pPjMy/",
    caption: "Quality craftsmanship"
  },
  {
    id: 6,
    embedUrl: "https://www.instagram.com/p/DFIT4kYRuWA/",
    caption: "Customer project"
  },
];

const InstagramSection = ({ variant = "home" }) => {
  const isFullPage = variant === "portfolio";
  const displayPosts = isFullPage ? instagramPosts : instagramPosts.slice(0, 4);
  const [loadedEmbeds, setLoadedEmbeds] = useState({});

  const handleEmbedLoad = (id) => {
    setLoadedEmbeds(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        {/* Header - matching site style */}
        <div className="text-center mb-12">
          <span className="text-accent font-semibold uppercase tracking-wider">Instagram</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2 mb-4">
            {isFullPage ? "Watch Our Work in Action" : "Follow Our Journey"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isFullPage 
              ? "Check out our Instagram to see transformation videos, before & after reveals, and behind-the-scenes of our painting projects."
              : "See our latest projects and transformations on Instagram."
            }
          </p>
        </div>

        {/* Instagram Embeds Grid */}
        <div className={`grid gap-6 ${isFullPage ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {displayPosts.map((post) => (
            <div
              key={post.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Instagram Embed */}
              <div className="relative w-full" style={{ minHeight: isFullPage ? '500px' : '450px' }}>
                {!loadedEmbeds[post.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <Instagram className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  </div>
                )}
                <iframe
                  src={`${post.embedUrl}embed`}
                  className="w-full h-full absolute inset-0"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency="true"
                  onLoad={() => handleEmbedLoad(post.id)}
                  style={{ minHeight: isFullPage ? '500px' : '450px' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Follow Button - matching site button style */}
        <div className="text-center mt-10">
          <a
            href={`https://www.instagram.com/${INSTAGRAM_HANDLE}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="btn-primary gap-2 px-8 py-6 text-lg">
              <Instagram className="w-5 h-5" />
              Follow @{INSTAGRAM_HANDLE}
            </Button>
          </a>
          {!isFullPage && (
            <p className="text-sm text-muted-foreground mt-4">
              See more reels and transformations on our Instagram
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
