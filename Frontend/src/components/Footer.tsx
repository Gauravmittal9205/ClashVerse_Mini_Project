import { Gamepad2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          <span className="font-display text-sm font-bold neon-text">ClashVerse</span>
        </div>
        <p className="font-body text-xs text-muted-foreground">
          © 2026 ClashVerse. All rights reserved. Built for warriors.
        </p>
        <div className="flex gap-6">
          {["Terms", "Privacy", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
