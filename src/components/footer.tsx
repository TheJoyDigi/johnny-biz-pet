import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 - About */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Ruh-Roh Retreat</h3>
            <p className="text-gray-300">
              Ruh-Roh Retreat connects pet parents with independent sitters who share our boutique philosophy of structure, comfort, and personalized attention.
            </p>
         </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/#benefits" className="text-gray-300 hover:text-white">Why Ruh-Roh</Link></li>
              <li><Link href="/#vacation-add-ons" className="text-gray-300 hover:text-white">Vacation Add-Ons</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-300 hover:text-white">How It Works</Link></li>
              <li><Link href="/#safety" className="text-gray-300 hover:text-white">Safety &amp; Trust</Link></li>
              <li><Link href="/#our-story" className="text-gray-300 hover:text-white">Our Story</Link></li>
              <li><Link href="/sitters" className="text-gray-300 hover:text-white">Meet Our Sitters</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              <li><Link href="/waiver" className="text-gray-300 hover:text-white">Waiver</Link></li>
              <li><Link href="/#booking" className="text-gray-300 hover:text-white">Book Now</Link></li>
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300">
              
              <li><a href="tel:+17143294534" className="hover:text-white">+1 (714) 329-4534</a></li>
              <li><a href="mailto:hello@ruhrohretreat.com" className="hover:text-white">hello@ruhrohretreat.com</a></li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-300 hover:text-white">Terms of Use</Link></li>
              <li><Link href="/waiver" className="text-gray-300 hover:text-white">Pet Sitting Waiver</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Ruh-Roh Retreat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
