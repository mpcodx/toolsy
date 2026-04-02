export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-2">Toolsy</h3>
            <p className="text-sm text-muted-foreground">
              Free online tools for PDF, video, image, archive, and text workflows. No signup required.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Popular Tools</h4>
            <ul className="space-y-2">
              <li>
                <a href="/tool/pdf-to-image" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  PDF to Image
                </a>
              </li>
              <li>
                <a href="/tool/image-to-pdf" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Image to PDF
                </a>
              </li>
              <li>
                <a href="/tool/pdf-merger" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  PDF Merger
                </a>
              </li>
              <li>
                <a href="/tool/video-to-audio" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Video to Audio
                </a>
              </li>
            </ul>
          </div>

          {/* Video */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Video Tools</h4>
            <ul className="space-y-2">
              <li>
                <a href="/tool/video-thumbnail-maker" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Thumbnail Maker
                </a>
              </li>
              <li>
                <a href="/tool/video-to-frames" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Video to Frames
                </a>
              </li>
              <li>
                <a href="/tool/video-clipper" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Video Clip Cutter
                </a>
              </li>
              <li>
                <a href="/tool/direct-mp4-downloader" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Direct MP4 Downloader
                </a>
              </li>
            </ul>
          </div>

          {/* Search tips */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Search Tips</h4>
            <ul className="space-y-2">
              <li>
                <a href="/?search=pdf merger" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  PDF merger
                </a>
              </li>
              <li>
                <a href="/?search=thumbnail maker" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Thumbnail maker
                </a>
              </li>
              <li>
                <a href="/?search=video to frames" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Video to frames
                </a>
              </li>
              <li>
                <a href="/?search=image compressor" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Image compressor
                </a>
              </li>
              <li>
                <a href="/?search=mp4 downloader" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  MP4 downloader
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Toolsy. All rights reserved.
            </p>
            <div className="flex flex-col items-center gap-3 text-center md:items-end md:text-right">
              <p className="text-sm text-muted-foreground">
                Built for quick conversions, shareable tool pages, and search-friendly landing pages.
              </p>
              <button
                type="button"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => window.dispatchEvent(new Event("toolsy:open-cookie-settings"))}
              >
                Cookie settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AdSense Placeholder */}
      <div className="bg-secondary/30 py-4 text-center text-xs text-muted-foreground">
        Advertisement space - AdSense ready
      </div>
    </footer>
  );
}
