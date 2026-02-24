import { motion } from "framer-motion";

const FinalCTA = () => {
  return (
    <section id="cta" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 glow-line" />

      {/* Glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-neon)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Are You Ready to Become the{" "}
          <span className="neon-text">Ultimate Champion?</span>
        </h2>
        <p className="font-body text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Join thousands of warriors competing, learning, and rising through the ranks every day.
        </p>
        <motion.a
          href="#"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="btn-neon text-lg px-12 py-4 inline-block"
        >
          🚀 Start Your Journey
        </motion.a>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
