import { useState, useEffect, useRef } from "react";
import { Brush, Clock, Users, ThumbsUp } from "lucide-react";

const stats = [
  { icon: Brush, endValue: 500, suffix: "+", label: "Projects Completed" },
  { icon: Users, endValue: 400, suffix: "+", label: "Happy Clients" },
  { icon: Clock, endValue: 2, suffix: "+", label: "Years Experience" },
  { icon: ThumbsUp, endValue: 100, suffix: "%", label: "Satisfaction Rate" },
];

// Animated counter hook
const useCountUp = (end, duration = 2000, start = 0, shouldStart = false) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * (end - start) + start));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start, shouldStart]);

  return count;
};

const AnimatedStat = ({ stat, index, isVisible }) => {
  const count = useCountUp(stat.endValue, 2000, 0, isVisible);

  return (
    <div
      className="text-center transform transition-all duration-500"
      style={{
        animationDelay: `${index * 0.1}s`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
      }}
    >
      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
        <stat.icon className="w-8 h-8 text-accent" />
      </div>
      <p className="text-4xl md:text-5xl font-heading font-black text-foreground mb-2">
        {count}{stat.suffix}
      </p>
      <p className="text-muted-foreground font-medium">{stat.label}</p>
    </div>
  );
};

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-secondary border-y border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat
              key={stat.label}
              stat={stat}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
