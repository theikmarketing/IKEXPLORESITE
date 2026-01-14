import { notFound } from "next/navigation";
import Link from "next/link";
import { getTourById } from "@/lib/tours";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function TourDetailPage({ params }: PageProps) {
  const tour = await getTourById(parseInt(params.id));

  if (!tour) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 w-full">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{tour.title}</h1>
          <p className="text-xl">{tour.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {tour.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Included */}
            {tour.included && tour.included.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">What&apos;s Included</h2>
                <ul className="space-y-2">
                  {tour.included.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Price</span>
                  <span className="text-3xl font-bold text-blue-600">${tour.price}</span>
                </div>
                <p className="text-sm text-gray-500">per person</p>
                <p className="text-sm text-gray-500 mt-2">Duration: {tour.duration}</p>
              </div>
              <Link href={`/tours/${tour.id}/book`}>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
                  Book Now
                </button>
              </Link>
              <Link href="/">
                <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Back to Tours
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
