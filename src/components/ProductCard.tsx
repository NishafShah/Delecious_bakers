import React from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import type { Product } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { toast } from 'react-toastify'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product)
    toast.success(`${product.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    })
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image_url || '/placeholder-cake.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-bakery-gold text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>

          {/* Heart Icon */}
          <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
            <Heart className="h-4 w-4 text-bakery-brown hover:text-red-500 transition-colors" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-bakery-chocolate mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-bakery-gold">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full group/btn"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
