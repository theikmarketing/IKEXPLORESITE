import Link from "next/link";
import { getAllTours } from "@/lib/tours";
import TourCard from "@/components/TourCard";

export const dynamic = 'force-dynamic';

export default async function ToursPage() {
  const tours = await getAllTours();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">All Tours</h1>
          <p className="text-xl md:text-2xl">
            Discover amazing travel experiences in Korea
          </p>
        </div>
      </div>

      {/* Tours List */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-gray-600 text-center">
            Showing {tours.length} tours available
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>
    </div>
  );
}
