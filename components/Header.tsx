import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">IK Explore</h1>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600 transition-colors">
              Tours
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
