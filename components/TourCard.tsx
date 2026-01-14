import Link from "next/link";
import { Tour } from "@/lib/tours";

interface TourCardProps {
  tour: Tour;
}

export default function TourCard({ tour }: TourCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <Link href={`/tours/${tour.id}`}>
        <div className="h-48 bg-gray-200 relative cursor-pointer">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/tours/${tour.id}`}>
            <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
              {tour.title}
            </h3>
          </Link>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {tour.duration}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{tour.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${tour.price}
          </span>
          <Link href={`/tours/${tour.id}`}>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
