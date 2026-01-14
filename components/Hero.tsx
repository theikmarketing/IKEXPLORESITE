"use client";

export default function Hero() {
  const scrollToTours = () => {
    const toursSection = document.getElementById("tours-section");
    if (toursSection) {
      const targetPosition = toursSection.offsetTop - 80; // 헤더 높이 고려
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1500; // 1.5초로 천천히 스크롤
      let start: number | null = null;

      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  return (
    <section className="relative w-full h-[250px] bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Discover Korea
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Experience the beauty and culture of Korea
        </p>
        <button
          onClick={scrollToTours}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Explore Tours
        </button>
      </div>
    </section>
  );
}
