import { useState, useEffect } from 'react'
import { Eye, Search, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-toastify'

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address: string
  phone: string
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  profiles?: {
    full_name?: string
    email?: string
  }
}

interface OrderItem {
  id: string
  order_id: string
  product_id: string
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
    pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
    confirmed: { variant: 'default' as const, label: 'Confirmed', icon: CheckCircle },
    preparing: { variant: 'default' as const, label: 'Preparing', icon: Clock },
    ready: { variant: 'default' as const, label: 'Ready', icon: CheckCircle },
    delivered: { variant: 'default' as const, label: 'Delivered', icon: CheckCircle },
    cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const OrderDetailsDialog = ({ 
  order, 
  onStatusUpdate 
}: {
  order: Order
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void
}) => {
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)

      if (error) throw error

      toast.success(`Order status updated to ${newStatus}`)
      onStatusUpdate(order.id, newStatus)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const statusOptions: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Order Details - #{order.id.slice(-8)}</DialogTitle>
        <DialogDescription>
          Order placed on {new Date(order.created_at).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={order.status} />
              <div className="flex gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={order.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating || order.status === status}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {order.profiles?.full_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Email:</span> {order.profiles?.email || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {order.phone}
            </div>
            <div>
              <span className="font-medium">Delivery Address:</span>
              <p className="mt-1 text-sm text-gray-600">{order.delivery_address}</p>
            </div>
            {order.notes && (
              <div>
                <span className="font-medium">Notes:</span>
                <p className="mt-1 text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{item.products?.name}</div>
                      <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  )
}

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
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
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm)
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orders Management</h2>
          <p className="text-slate-600">Manage customer orders and delivery status</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by ID, customer name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      #{order.id.slice(-8)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {order.profiles?.full_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.profiles?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.order_items?.length || 0} items
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowDetailsDialog(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </Dialog>
    </div>
  )
}