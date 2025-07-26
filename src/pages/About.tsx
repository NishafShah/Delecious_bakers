import React from 'react'

export const About: React.FC = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-bakery-chocolate mb-8 text-center">
          About Delicious Bakers
        </h1>
        <div className="prose prose-lg mx-auto text-bakery-brown">
          <p>
            Welcome to Delicious Bakers, where every bite tells a story of passion, 
            tradition, and the finest ingredients. Founded in 2020, we've been 
            committed to bringing you the freshest, most delicious baked goods 
            that remind you of home.
          </p>
          <p>
            Our journey began with a simple belief: that great baking starts with 
            great ingredients and lots of love. From our signature chocolate cakes 
            to our daily fresh bread, every item is crafted with care and attention 
            to detail.
          </p>
        </div>
      </div>
    </div>
  )
}
