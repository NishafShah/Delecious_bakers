import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Users, Award, Clock, Quote, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/ProductCard'
import { getFeaturedProducts, getTestimonials, type Product, type Testimonial } from '@/lib/supabase'

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [productsData, testimonialsData] = await Promise.all([
        getFeaturedProducts(6),
        getTestimonials(3)
      ])
      
      setFeaturedProducts(productsData)
      setTestimonials(testimonialsData)
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-bakery-cream to-bakery-peach py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/bakery-hero-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-bakery-chocolate mb-6 animate-float">
              Delicious Bakers
            </h1>
            <p className="text-xl md:text-2xl text-bakery-brown mb-8 max-w-3xl mx-auto">
              Freshly baked goods made with love and the finest ingredients. 
              From artisan breads to decadent desserts, we bring joy to every bite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                <Link to="/about">Learn Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-bakery-gold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-bakery-chocolate mb-2">1000+</div>
              <div className="text-bakery-brown">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="bg-bakery-gold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-bakery-chocolate mb-2">4.9</div>
              <div className="text-bakery-brown">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="bg-bakery-gold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-bakery-chocolate mb-2">15+</div>
              <div className="text-bakery-brown">Awards Won</div>
            </div>
            <div className="text-center">
              <div className="bg-bakery-gold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-bakery-chocolate mb-2">2hrs</div>
              <div className="text-bakery-brown">Fresh Daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-bakery-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-bakery-chocolate mb-4">
              Featured Delights
            </h2>
            <p className="text-lg text-bakery-brown max-w-2xl mx-auto">
              Discover our most popular creations, crafted with passion and the finest ingredients
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-bakery-brown text-lg mb-4">
                    No featured products available at the moment
                  </p>
                  <Button asChild>
                    <Link to="/products">View All Products</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-amber-900 mb-4">
              What Our Customers Are Saying
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Hear from our delighted customers who love our fresh baked goods!
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-40 animate-pulse border"></div>
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-md border-amber-200">
                  <CardContent className="p-6">
                    <Quote className="h-6 w-6 text-amber-500 mb-4" />
                    <p className="text-amber-800 mb-6 italic">
                      "{testimonial.comment}"
                    </p>
                    <div className="flex items-center">
                      {testimonial.image_url && (
                        <img
                          src={testimonial.image_url}
                          alt={testimonial.customer_name}
                          className="w-12 h-12 rounded-full mr-4 border-2 border-amber-200"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-amber-900">
                          {testimonial.customer_name}
                        </p>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChefHat className="mx-auto h-16 w-16 text-amber-400 mb-4" />
              <p className="text-amber-700 text-lg">
                We'd love to hear from you! Be our first reviewer.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-bakery-gold">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Taste Heaven?
          </h2>
          <p className="text-xl text-bakery-cream mb-8">
            Join thousands of satisfied customers who start their day with our fresh baked goods
          </p>
          <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-4">
            <Link to="/contact">Order Custom Cake</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
