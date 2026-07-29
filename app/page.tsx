import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Tape from "@/components/Tape";
import Holdings from "@/components/Holdings";
import StudioShowcase from "@/components/StudioShowcase";
import Capabilities from "@/components/Capabilities";
import Rooms from "@/components/Rooms";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export default function Home() {
  return (
    <>
      <Nav />

      <div className="wrap">
        <Hero />
      </div>

      <Tape />

      <div className="wrap">
        <Holdings />
        <StudioShowcase />
        <Capabilities />
        <Rooms />
        <Cta />
        <Footer />
      </div>

      <RevealObserver />
    </>
  );
}
