import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          Eonia
        </Link>
        <div>
          <Link
            href="/#"
            className="rounded-md px-3 py-2 text-gray-300 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/contact"
            className="rounded-md px-3 py-2 text-gray-300 hover:text-white"
          >
            Contact
          </Link>
          <Link
            href="/world-map"
            className="rounded-md px-3 py-2 text-gray-300 hover:text-white"
          >
            World Map
          </Link>
          <Link
            href="/maps"
            className="rounded-md px-3 py-2 text-gray-300 hover:text-white"
          >
            Maps
          </Link>
        </div>
      </div>
    </nav>
  );
}
