"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 bg-white">
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 text-center mb-6">
        Society Management System
      </h1>
      <p className="max-w-2xl text-lg text-gray-600 text-center mb-8">
        Manage your society memberships, events, and community efficiently.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/signup"
          className="px-8 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/about"
          className="px-8 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
}
