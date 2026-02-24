import { motion } from "framer-motion";
import { Shield, Swords, Heart, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Clan / Guild System",
    desc: "Create or join a guild. Build your team and compete as a unit.",
  },
  {
    icon: Swords,
    title: "Team vs Team Battles",
    desc: "Challenge other teams in organized competitive matches.",
  },
  {
    icon: Heart,
    title: "Friends & Rivals",
    desc: "Add friends, set rivals, and track head-to-head stats.",
  },
  {
    icon: MessageCircle,
    title: "Community Chat",
    desc: "Connect with warriors in real-time chat rooms and forums.",
  },
];

const Community = () => {
  return (
    <section id="community" className="section-padding relative">
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Community & <span className="neon-text">Team Battles</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            Battle alone or dominate together. The choice is yours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 flex gap-4"
            >
              <div
                className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-neon)" }}
              >
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold mb-1">{f.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Community;
