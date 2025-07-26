import React from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'

export const Cart: React.FC = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-bakery-gold mb-6" />
            <h1 className="font-display text-3xl font-bold text-bakery-chocolate mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-bakery-brown mb-8">
              Looks like you haven't added any delicious treats to your cart yet.
            </p>
            <Button asChild size="lg">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl font-bold text-bakery-chocolate">
            Shopping Cart
          </h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {state.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.image_url || '/placeholder-cake.jpg'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-bakery-chocolate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.product.category}</p>
                    <p className="text-lg font-bold text-bakery-gold">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-bakery-chocolate">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        <Card className="bg-bakery-cream">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-bakery-chocolate">
                Total Items: {state.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <span className="text-2xl font-bold text-bakery-gold">
                ${state.total.toFixed(2)}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button className="flex-1" size="lg">
                Proceed to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
