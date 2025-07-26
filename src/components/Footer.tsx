import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-amber-900 text-amber-50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-4 text-amber-100">
              Delicious Bakes
            </h3>
            <p className="text-amber-200 mb-4">
              Freshly baked goods made with love and the finest ingredients. 
              From artisan breads to decadent desserts, we bring joy to every bite.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-amber-300 hover:text-amber-100 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-amber-300 hover:text-amber-100 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-amber-300 hover:text-amber-100 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-amber-100 text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-amber-200 hover:text-amber-100 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-amber-200 hover:text-amber-100 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-amber-200 hover:text-amber-100 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-amber-200 hover:text-amber-100 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-amber-200 hover:text-amber-100 transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-amber-100 text-lg mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-amber-300" />
                <span className="text-amber-200">123 Baker Street, Sweet City, SC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-amber-300" />
                <span className="text-amber-200">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-amber-300" />
                <span className="text-amber-200">info@deliciousbakes.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-semibold text-amber-100 text-lg mb-4">Opening Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-amber-300" />
                <div className="text-amber-200">
                  <div>Mon - Fri: 6:00 AM - 8:00 PM</div>
                  <div>Sat - Sun: 7:00 AM - 9:00 PM</div>
                </div>
              </li>
            </ul>
            <div className="mt-4">
              <h5 className="font-medium text-amber-100 mb-2">Fresh Daily</h5>
              <p className="text-amber-300 text-sm">
                All our products are baked fresh every morning using premium ingredients.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-800 mt-8 pt-8 text-center">
          <p className="text-amber-300">
            &copy; 2025 Delicious Bakes. All rights reserved. Made with ❤️ for bakery lovers.
          </p>
        </div>
      </div>
    </footer>
  )
}
