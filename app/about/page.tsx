import { getAboutContent } from "@/lib/content";

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const content = await getAboutContent();
  const heroTitle = content?.heroTitle || "About Us";
  const heroSubtitle = content?.heroSubtitle || "Your trusted partner for discovering Korea";
  const story = content?.story || "IK Explore was founded with a passion for sharing the beauty and culture of Korea with travelers from around the world. We believe that travel is not just about visiting places, but about experiencing the heart and soul of a destination.";
  const mission = content?.mission || "To provide authentic, memorable, and sustainable travel experiences that connect visitors with the rich heritage and vibrant culture of Korea, while supporting local communities and preserving the natural beauty of our country.";
  const reasons = content?.reasons || [
    "Local Expertise: Our guides are local experts who know the hidden gems and authentic experiences that make Korea special.",
    "Small Groups: We keep our tour groups small to ensure personalized attention and a more intimate experience.",
    "Flexible Options: From day trips to multi-day adventures, we offer tours that fit your schedule and interests.",
    "24/7 Support: Our customer service team is available around the clock to assist you before, during, and after your trip.",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-xl md:text-2xl">{heroSubtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-4 text-gray-700">
            <p className="text-lg leading-relaxed">{story}</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-700 leading-relaxed">{mission}</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reasons.map((reason, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600">{reason}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
