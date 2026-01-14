"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PayPalButton from "@/components/PayPalButton";

interface Tour {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  highlights?: string[];
  itinerary?: string[];
  included?: string[];
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: "",
    guests: "1",
    specialRequests: "",
  });

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch(`/api/tours/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setTour(data);
        }
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTour();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tour not found</h1>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation - PayPal button will handle payment
  };

  const handlePayPalSuccess = (details: any) => {
    // PayPal 결제 성공 후 예약 정보 저장
    console.log("PayPal payment successful:", details);
    console.log("Booking submitted:", { tourId: tour.id, ...formData, paymentId: details.id });
    // 여기서 백엔드에 예약 정보 전송
    setIsSubmitted(true);
  };

  const handlePayPalError = (err: any) => {
    console.error("PayPal payment error:", err);
    alert("Payment failed. Please try again.");
  };

  const totalPrice = tour.price * parseInt(formData.guests);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your booking. We&apos;ve sent a confirmation email to{" "}
              <span className="font-semibold">{formData.email}</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-gray-800 mb-4">Booking Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tour:</span>
                <span className="font-semibold">{tour.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-semibold">{formData.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-semibold text-blue-600">${totalPrice}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Back to Home
              </button>
            </Link>
            <Link href={`/tours/${tour.id}`}>
              <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                View Tour Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/tours/${tour.id}`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Tour Details
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Book Your Tour</h1>
          <p className="text-gray-600">Complete the form below to reserve your spot</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Contact Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tour Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="guests"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Number of Guests *
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      required
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="specialRequests"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows={4}
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Any dietary restrictions, accessibility needs, or other special requests..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment</h3>
                  <PayPalButton
                    amount={totalPrice}
                    description={`${tour.title} - ${formData.guests} ${parseInt(formData.guests) === 1 ? "Guest" : "Guests"}`}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
              <div className="mb-4">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-gray-800 mb-2">{tour.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{tour.duration}</p>
              </div>
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per person</span>
                  <span className="text-gray-800">${tour.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guests</span>
                  <span className="text-gray-800">
                    {formData.guests} {parseInt(formData.guests) === 1 ? "Guest" : "Guests"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-800">
                    {formData.date || "Select date"}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
