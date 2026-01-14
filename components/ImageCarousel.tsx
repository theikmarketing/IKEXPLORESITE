"use client";

import { useState, useEffect } from "react";

type CarouselImage = {
  id: number;
  url: string;
  title: string;
  description: string;
};

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/carousel", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setImages(Array.isArray(data) ? data : []);
        }
      } catch {
        setImages([]);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    if (images.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  if (images.length === 0) {
    return (
      <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">등록된 캐러셀 이미지가 없습니다.</div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                  {image.title}
                </h2>
                <p className="text-xl md:text-2xl">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all z-10"
        aria-label="Previous image"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all z-10"
        aria-label="Next image"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white bg-opacity-50 hover:bg-opacity-75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
