import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BattleModes from "@/components/BattleModes";
import Gamification from "@/components/Gamification";
import LiveArena from "@/components/LiveArena";
import HowItWorks from "@/components/HowItWorks";
import Community from "@/components/Community";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <div className={loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <Navbar />
        <Hero />
        <BattleModes />
        <Gamification />
        <LiveArena />
        <HowItWorks />
        <Community />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
};

export default Index;
