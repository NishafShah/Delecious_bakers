import React from 'react'

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-bakery-chocolate mb-8 text-center">
          Contact Us
        </h1>
        <div className="text-center text-bakery-brown">
          <p className="text-lg mb-4">
            Get in touch with us for custom orders, catering, or any questions!
          </p>
          <p>Email: info@deliciousbakers.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
      </div>
    </div>
  )
}
