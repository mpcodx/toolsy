import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          className="flex items-center gap-3 text-left"
          onClick={() => setLocation("/")}
          aria-label="Go to home page"
        >
          <img
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            className="h-10 w-10 shrink-0"
            decoding="async"
          />
          <div className="hidden sm:flex flex-col">
            <h1 className="text-lg font-display font-bold text-foreground">Toolsy</h1>
            <p className="text-xs text-muted-foreground">PDF, video & image tools</p>
          </div>
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              className="pl-10 pr-4 py-2 bg-secondary/50 border-secondary focus:border-accent focus:ring-1 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setLocation("/tool/video-to-audio")}
          >
            Video tools
          </Button>
          <Button
            type="button"
            variant="outline"
            className="hidden sm:inline-flex text-sm font-medium"
            onClick={() => setLocation("/?search=pdf")}
          >
            PDF tools
          </Button>
        </div>
      </div>
    </header>
  );
}
