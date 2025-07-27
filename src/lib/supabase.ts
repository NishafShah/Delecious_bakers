import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

console.log("🔐 Supabase URL:", supabaseUrl)
console.log("🔐 Supabase Key Exists:", !!supabaseKey)

export const supabase = createClient(supabaseUrl, supabaseKey)

// ----------------------------
// 🧩 Types
// ----------------------------
export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export type CartItem = Product & { quantity: number }

export type Testimonial = {
  id: string
  name: string
  message: string
  avatar_url: string
}

// ----------------------------
// 🧩 Functions
// ----------------------------

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*')
  if (error) throw error
  return data as Product[]
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('featured', true)
  if (error) throw error
  return data as Product[]
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase.from('testimonials').select('*')
  if (error) throw error
  return data as Testimonial[]
}
