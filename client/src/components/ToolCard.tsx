import { Tool } from "@/lib/tools";
import * as Icons from "lucide-react";
import { useLocation } from "wouter";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const [, setLocation] = useLocation();
  
  // Get the icon component dynamically
  const IconComponent = (Icons as any)[tool.icon] || Icons.Zap;

  const handleClick = () => {
    setLocation(`/tool/${tool.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 cursor-pointer transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1"
    >
      {tool.featured ? (
        <span className="absolute right-4 top-4 z-20 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          Popular
        </span>
      ) : null}

      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${tool.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-accent transition-colors">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {tool.description}
        </p>

        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/50 text-xs font-medium text-muted-foreground">
            {tool.category}
          </span>
          <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            <Icons.ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Gradient Border on Hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
