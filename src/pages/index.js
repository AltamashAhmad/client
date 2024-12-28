import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-black">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-white">
          Train Ticket Booking System
        </h1>
        <p className="text-gray-300 mb-8 text-lg">
          Book your train tickets easily and securely
        </p>
        <div className="space-x-6">
          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
