import TourCard from "./TourCard";
import { getAllTours } from "@/lib/tours";

export default async function TourCardList() {
  const tours = await getAllTours();

  return (
    <section id="tours-section" className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Featured Tours
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  );
}
