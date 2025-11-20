import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 h-[80px] flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-logo">
            <Image
              src="/logo.png"
              alt="Ruh-Roh Retreat Logo"
              width={320}
              height={80}
              priority
            />
          </Link>
        </div>
        <nav className="hidden lg:flex space-x-8 h-[80px] items-center">
          <Link href="/" className="text-gray-800 hover:text-[#1A9CB0] font-medium">
            Home
          </Link>

          <Link href="/#benefits" className="text-gray-800 hover:text-[#1A9CB0] font-medium">
            Why Ruh-Roh
          </Link>
          <Link href="/#about" className="text-gray-800 hover:text-[#1A9CB0] font-medium">
            About
          </Link>
          <Link href="/sitters" className="text-gray-800 hover:text-[#1A9CB0] font-medium">
            Meet Our Sitters
          </Link>
          <Link href="/#testimonials" className="text-gray-800 hover:text-[#1A9CB0] font-medium">
            Testimonials
          </Link>
          <Link href="/blog" className="text-gray-800 hover:text-[#1A9CB0] font-medium">
            Blog
          </Link>
          <Link href="/waiver" className="text-gray-800 hover:text-[#1A9CB0] font-medium">
            Waiver
          </Link>
        </nav>
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1A9CB0]"
        >
          <span className="sr-only">Open menu</span>
          {!mobileMenuOpen ? (
            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <Link href="/" className="text-logo">
              <Image src="/logo.png" alt="Ruh-Roh Retreat Logo" width={320} height={80} priority />
            </Link>
            <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-[#1A9CB0]">
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <nav className="flex-1 flex flex-col p-4 space-y-4">
            <Link
              href="/"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/#benefits"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Why Ruh-Roh
            </Link>
            <Link
              href="/#about"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/sitters"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Meet Our Sitters
            </Link>
            <Link
              href="/#testimonials"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              href="/#booking"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
            <Link
              href="/blog"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/waiver"
              className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Waiver
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
