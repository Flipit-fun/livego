import Background from "@/components/Background";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Tape from "@/components/Tape";
import Wallet from "@/components/Wallet";
import Studio from "@/components/Studio";
import Rooms from "@/components/Rooms";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import { RoomProvider } from "@/components/RoomContext";

export default function Home() {
  return (
    <RoomProvider>
      <Background />
      <Nav />

      <div className="wrap">
        <Hero />
      </div>

      <Tape />

      <div className="wrap">
        <Wallet />
        <Studio />
        <Rooms />
        <Cta />
        <Footer />
      </div>

      <RevealObserver />
    </RoomProvider>
  );
}
