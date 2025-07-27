import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ Debug logs to verify environment variables
if (typeof window !== 'undefined') {
  console.log("✅ [Supabase] URL:", supabaseUrl)
  console.log("✅ [Supabase] Anon Key:", supabaseAnonKey ? '[Present ✅]' : '[Missing ❌]')
}

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL. Check your .env or Vercel Project Settings.')
}

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY. Check your .env or Vercel Project Settings.')
}

// ✅ Create client with fallback to prevent crash
export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co',
  supabaseAnonKey || 'missing-anon-key'
)

// -------------------- Types --------------------
export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  ingredients?: string
  nutrition_info?: string
  in_stock: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export type CartItem = {
  id: string
  quantity: number
  product: Product
}

export type User = {
  id: string
  email: string
  full_name?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address: string
  phone: string
  notes?: string
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export type ContactMessage = {
  id?: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  created_at?: string
}

export type Testimonial = {
  id: string
  customer_name: string
  rating: number
  comment: string
  image_url?: string
  created_at: string
}

// -------------------- API Functions --------------------
export const getProducts = async (category?: string) => {
  console.log("📦 [getProducts] Fetching products for category:", category)

  let query = supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    console.error("❌ [getProducts] Supabase error:", error)
    throw error
  }

  console.log("✅ [getProducts] Fetched products:", data)
  return data as Product[]
}

export const getFeaturedProducts = async (limit = 6) => {
  console.log("🌟 [getFeaturedProducts] Limit:", limit)

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('in_stock', true)
    .limit(limit)

  if (error) {
    console.error("❌ [getFeaturedProducts] Error:", error)
    throw error
  }

  console.log("✅ [getFeaturedProducts] Data:", data)
  return data as Product[]
}

export const getProduct = async (id: string) => {
  console.log("🔍 [getProduct] ID:", id)

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error("❌ [getProduct] Error:", error)
    throw error
  }

  return data as Product
}

export const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
  console.log("🧾 [createOrder] Data:", orderData)

  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()

  if (error) {
    console.error("❌ [createOrder] Error:", error)
    throw error
  }

  return data as Order
}

export const createOrderItems = async (orderItems: Omit<OrderItem, 'id' | 'created_at'>[]) => {
  console.log("📦 [createOrderItems] Items:", orderItems)

  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select()

  if (error) {
    console.error("❌ [createOrderItems] Error:", error)
    throw error
  }

  return data as OrderItem[]
}

export const getUserOrders = async (userId: string) => {
  console.log("📜 [getUserOrders] UserID:", userId)

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("❌ [getUserOrders] Error:", error)
    throw error
  }

  return data
}

export const submitContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'created_at'>) => {
  console.log("📨 [submitContactMessage] Data:", messageData)

  const { data, error } = await supabase
    .from('contact_messages')
    .insert([messageData])
    .select()
    .single()

  if (error) {
    console.error("❌ [submitContactMessage] Error:", error)
    throw error
  }

  return data as ContactMessage
}

export const getTestimonials = async (limit = 6) => {
  console.log("🗣 [getTestimonials] Limit:", limit)

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error("❌ [getTestimonials] Error:", error)
    throw error
  }

  return data as Testimonial[]
}
