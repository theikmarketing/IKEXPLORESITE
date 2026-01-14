import Hero from "@/components/Hero";
import ImageCarousel from "@/components/ImageCarousel";
import TourCardList from "@/components/TourCardList";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ImageCarousel />
      <TourCardList />
    </main>
  );
}
