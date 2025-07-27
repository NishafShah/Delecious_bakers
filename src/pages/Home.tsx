"use client";

import { useEffect, useState } from "react";
import { getFeaturedProducts } from "@/lib/supabase/products";
import { getTestimonials } from "@/lib/supabase/testimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
};

type Testimonial = {
  id: string;
  name: string;
  message: string;
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    console.log("🏠 Home component mounted.");
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      console.log("📦 Fetching featured products and testimonials...");
      const [productsData, testimonialsData] = await Promise.all([
        getFeaturedProducts(6),
        getTestimonials(3),
      ]);

      console.log("✅ Fetched Products:", productsData);
      console.log("✅ Fetched Testimonials:", testimonialsData);

      setFeaturedProducts(productsData);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error("❌ Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Welcome to Our Bakery</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4 flex flex-col gap-2">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-gray-500">{product.description}</p>
                <p className="text-pink-600 font-semibold">Rs. {product.price}</p>
                <Button onClick={() => addToCart(product)} className="mt-2">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Customer Testimonials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-4">
                <p className="text-gray-700 italic">"{testimonial.message}"</p>
                <p className="text-right mt-2 font-semibold">- {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
