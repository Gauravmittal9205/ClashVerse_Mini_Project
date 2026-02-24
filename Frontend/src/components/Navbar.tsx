import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Trophy,
  Users,
  LayoutDashboard,
  Gift,
  User,
  Code,
  MessageSquare,
  Mic,
  Brain,
  Radio,
  Calendar,
  Award,
  Zap,
  Shield,
  BarChart3,
  MessageCircle,
  Target,
  TrendingUp,
  Flame,
  Medal,
  FileText,
  Star,
  BadgeCheck,
  Ticket,
  Edit,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

interface NavItem {
  label: string;
  icon: any;
  href?: string;
  submenu?: { label: string; icon: any; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Arena",
    icon: Swords,
    submenu: [
      { label: "Coding Arena", icon: Code, href: "#code" },
      { label: "GD Arena", icon: MessageSquare, href: "#message" },
      { label: "Debate Arena", icon: Mic, href: "#mic" },
      { label: "Quiz Arena", icon: Brain, href: "#brain" },
    ],
  },
  {
    label: "Competitions",
    icon: Trophy,
    submenu: [
      { label: "Live Contests", icon: Radio, href: "#live" },
      { label: "Upcoming Battles", icon: Calendar, href: "#upcoming" },
      { label: "Past Results", icon: Award, href: "#results" },
      { label: "1v1 Duels", icon: Zap, href: "#duels" },
    ],
  },
  {
    label: "Community",
    icon: Users,
    submenu: [
      { label: "Clans / Guilds", icon: Shield, href: "#clans" },
      { label: "Leaderboard", icon: BarChart3, href: "#leaderboard" },
      { label: "Discussion Forum", icon: MessageCircle, href: "#forum" },
      { label: "Challenges", icon: Target, href: "#challenges" },
    ],
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    submenu: [
      { label: "My Performance", icon: TrendingUp, href: "#performance" },
      { label: "Streaks", icon: Flame, href: "#streaks" },
      { label: "Achievements", icon: Medal, href: "#achievements" },
      { label: "Submission History", icon: FileText, href: "#submissions" },
    ],
  },
  {
    label: "Rewards",
    icon: Gift,
    submenu: [
      { label: "XP & Rank", icon: Star, href: "#rank" },
      { label: "Badges", icon: BadgeCheck, href: "#badges" },
      { label: "Redeem Points", icon: Ticket, href: "#redeem" },
    ],
  },
  {
    label: "Profile",
    icon: User,
    submenu: [
      { label: "Edit Profile", icon: Edit, href: "#edit-profile" },
      { label: "Settings", icon: Settings, href: "#settings" },
      { label: "Notifications", icon: Bell, href: "#notifications" },
      { label: "Logout", icon: LogOut, href: "#logout" },
    ],
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-card border-b border-glass-border/30 shadow-glow-neon py-2" : "bg-transparent py-4 text-white"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Zap className="w-4 h-4 text-primary fill-current" />
          </div>
          <span className="font-logo font-bold text-lg tracking-tight neon-text uppercase">
            ClashVerse
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={item.href || "#"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all duration-200 uppercase tracking-wider ${activeDropdown === item.label ? "text-primary " : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
                {item.submenu && (
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180 text-primary" : ""}`} />
                )}
              </a>

              {/* Submenu */}
              <AnimatePresence>
                {item.submenu && activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-64 glass-card border border-glass-border/30 shadow-2xl overflow-hidden"
                  >
                    <div className="p-2 grid gap-1">
                      {item.submenu.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary/10 hover:text-primary transition-all group"
                        >
                          <sub.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">{sub.label}</span>
                        </a>
                      ))}
                    </div>
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <div className="ml-4 pl-4 border-l border-glass-border/30">
            <a href="#cta" className="btn-neon text-xs py-2 px-6 flex items-center gap-2 group">
              <Zap className="w-3 h-3 fill-current group-hover:animate-pulse" />
              JOIN ARENA
            </a>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="xl:hidden p-2 rounded-lg glass-card border-glass-border/30 text-foreground"
        >
          {mobileOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-80 glass-card border-l border-glass-border/30 z-50 p-6 flex flex-col gap-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-xl neon-text">NAVIGATE</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 glass-card hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <div key={item.label} className="flex flex-col">
                  {item.submenu ? (
                    <div className="flex flex-col">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${activeDropdown === item.label ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`font-display text-sm font-semibold tracking-wide ${activeDropdown === item.label ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === item.label ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                      </button>

                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-primary/5 rounded-lg ml-6 mt-1 overflow-hidden"
                          >
                            {item.submenu.map((sub) => (
                              <a
                                key={sub.label}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 py-3 px-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary"
                              >
                                <sub.icon className="w-3.5 h-3.5 opacity-70" />
                                <span className="text-sm">{sub.label}</span>
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a
                      href={item.href || "#"}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span className="font-display text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground">{item.label}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-glass-border/30">
              <a href="#cta" className="btn-neon w-full py-4 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 fill-current" />
                JOIN ARENA NOW
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

