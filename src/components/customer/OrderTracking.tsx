import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

interface Order {
  id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address: string
  phone: string
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  products?: {
    name: string
    description?: string
    image_url?: string
  }
}

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800', 
      label: 'Order Placed', 
      icon: Clock,
      description: 'Your order has been received and is being processed'
    },
    confirmed: { 
      color: 'bg-blue-100 text-blue-800', 
      label: 'Confirmed', 
      icon: CheckCircle,
      description: 'Your order has been confirmed and approved'
    },
    preparing: { 
      color: 'bg-orange-100 text-orange-800', 
      label: 'Preparing', 
      icon: Package,
      description: 'Our bakers are preparing your delicious items'
    },
    ready: { 
      color: 'bg-green-100 text-green-800', 
      label: 'Ready for Pickup/Delivery', 
      icon: Truck,
      description: 'Your order is ready and will be delivered soon'
    },
    delivered: { 
      color: 'bg-green-100 text-green-800', 
      label: 'Delivered', 
      icon: CheckCircle,
      description: 'Your order has been successfully delivered'
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800', 
      label: 'Cancelled', 
      icon: Clock,
      description: 'This order has been cancelled'
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  )
}

const OrderStatusTimeline = ({ status, createdAt }: { status: Order['status'], createdAt: string }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'ready', label: 'Ready', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ]

  const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']
  const currentIndex = statusOrder.indexOf(status)

  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-800 font-medium">Order Cancelled</p>
          <p className="text-red-600 text-sm">This order has been cancelled</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        
        return (
          <div key={step.key} className="flex items-center space-x-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isCompleted 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
              }
              ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}
            `}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-500'}`}>
                {step.label}
              </div>
              {isCurrent && (
                <div className="text-sm text-green-600">
                  Current status
                </div>
              )}
              {isCompleted && index === 0 && (
                <div className="text-sm text-gray-500">
                  {format(new Date(createdAt), 'MMM dd, yyyy h:mm a')}
                </div>
              )}
            </div>
            
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        )
      })}
    </div>
  )
}

const OrderCard = ({ order }: { order: Order }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
            <CardDescription>
              Placed on {format(new Date(order.created_at), 'MMM dd, yyyy h:mm a')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${order.total_amount.toFixed(2)}
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Order Items Summary */}
          <div>
            <h4 className="font-medium mb-2">Items ({order.order_items?.length || 0})</h4>
            <div className="space-y-2">
              {order.order_items?.slice(0, expanded ? undefined : 2).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{item.products?.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              {(order.order_items?.length || 0) > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="w-full"
                >
                  {expanded ? 'Show Less' : `Show ${(order.order_items?.length || 0) - 2} More Items`}
                </Button>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Delivery Address</span>
              </div>
              <p className="text-blue-700 text-sm">{order.delivery_address}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Contact</span>
              </div>
              <p className="text-blue-700 text-sm">{order.phone}</p>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="font-medium text-amber-800 mb-1">Special Instructions</div>
              <p className="text-amber-700 text-sm">{order.notes}</p>
            </div>
          )}

          {/* Status Timeline */}
          <div>
            <h4 className="font-medium mb-3">Order Progress</h4>
            <OrderStatusTimeline status={order.status} createdAt={order.created_at} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const OrderTracking = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              description,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load your orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_items?.some(item => 
      item.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Login Required</h3>
            <p className="text-slate-600 mb-4">Please log in to track your orders</p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Track Your Orders</h1>
          <p className="text-amber-700">Monitor the status of your delicious bakery orders</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div>
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm ? 'No matching orders found' : 'No orders yet'}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start by placing your first order from our delicious selection'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => window.location.href = '/products'}>
                  Browse Products
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}