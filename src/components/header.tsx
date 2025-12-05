import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Why Ruh-Roh", href: "/#benefits" },
  { label: "Vacation Add-Ons", href: "/vacation-add-ons" },
  { label: "Badges", href: "/badges" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Safety & Trust", href: "/#safety" },
  { label: "Our Story", href: "/our-story" },
  { label: "Legal", href: "/legal-transparency" },
  { label: "Meet Our Sitters", href: "/sitters" },
  { label: "Blog", href: "/blog" },
  { label: "Waiver", href: "/waiver" },
] as const;



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
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1A9CB0]"
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
      <div className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
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
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={`${label}-${href}`}
                href={href}
                className="text-xl font-medium text-gray-800 hover:text-[#1A9CB0]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-full bg-white border-2 border-[#1A9CB0] px-6 py-3 text-lg font-semibold text-[#1A9CB0] shadow-sm hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Submit a Request
              </Link>
              <Link
                href="/sitters"
                className="inline-flex items-center justify-center rounded-full bg-[#1A9CB0] px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-[#147384]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Sitter
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
