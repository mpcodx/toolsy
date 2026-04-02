import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useState } from "react";

/**
 * Coming Soon Placeholder Component
 * Used for tools that are under development
 */

interface ComingSoonProps {
  toolId: string;
  toolName: string;
}

export default function ComingSoon({ toolId, toolName }: ComingSoonProps) {
  const [subscribed, setSubscribed] = useState(false);

  const handleNotify = () => {
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20 p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full opacity-20 blur-xl" />
            <div className="relative bg-gradient-to-br from-primary to-accent rounded-full p-6">
              <Bell className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-3">
          {toolName} Coming Soon
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
          We're building an amazing {toolName} tool. Check back soon for updates!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleNotify}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={subscribed}
          >
            {subscribed ? "✓ Notification enabled" : "Notify me when ready"}
          </Button>
          
          <Button variant="outline">
            View updates on Twitter
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-8 max-w-md mx-auto">
          Tool ID: {toolId}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Planned Features
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Fast processing</li>
            <li>✓ Secure & private</li>
            <li>✓ No file uploads to servers</li>
            <li>✓ Batch operations</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card/50 p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            Why wait?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Explore our other tools while you wait. We have many powerful tools available right now.
          </p>
          <p className="text-xs text-muted-foreground">
            Updates rolled out weekly
          </p>
        </div>
      </div>
    </div>
  );
}
