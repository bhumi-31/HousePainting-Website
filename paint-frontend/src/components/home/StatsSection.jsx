import { Brush, Clock, Shield, Award, Users, ThumbsUp } from "lucide-react";

const stats = [
  { icon: Brush, value: "500+", label: "Projects Completed" },
  { icon: Users, value: "400+", label: "Happy Clients" },
  { icon: Clock, value: "2+", label: "Years Experience" },
  { icon: ThumbsUp, value: "100%", label: "Satisfaction Rate" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-secondary border-y border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-accent" />
              </div>
              <p className="text-4xl md:text-5xl font-heading font-black text-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
