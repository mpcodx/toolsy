import { Search, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { searchTools } from "@/lib/tools";
import { getToolIcon } from "@/lib/tool-icons";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const suggestions = searchQuery.trim() ? searchTools(searchQuery).slice(0, 5) : [];

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
            <p className="text-xs text-muted-foreground">AI, creator, PDF & video tools</p>
          </div>
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <div className="relative w-full z-30">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search meta titles, reel hooks, PDF tools..."
              className="pl-10 pr-4 py-2 bg-secondary/50 border-secondary focus:border-accent focus:ring-1 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Instant Search Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg overflow-hidden divide-y divide-border/60">
                {suggestions.map((tool) => {
                  const IconComp = getToolIcon(tool.icon);
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        setLocation(`/tool/${tool.id}`);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/10 transition-colors duration-200 group"
                    >
                      <div className={`p-1.5 rounded bg-gradient-to-br ${tool.color} text-white shrink-0`}>
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                          {tool.name}
                        </p>
                      </div>
                      <span className="text-[8px] uppercase font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">
                        {tool.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {toggleTheme && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground rounded-full h-10 w-10 relative overflow-hidden group"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <div className="relative h-5 w-5">
                <Sun className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-amber-500"}`} />
                <Moon className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${theme === "dark" ? "rotate-0 scale-100 opacity-100 text-sky-400" : "-rotate-90 scale-0 opacity-0"}`} />
              </div>
            </Button>
          )}
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
