// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// ✅ Add these types if not defined elsewhere
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

export type Testimonial = {
  id: string;
  name: string;
  message: string;
  rating: number;
};

export type CartItem = Product & {
  quantity: number;
};

// ✅ Sample fetching functions
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return data as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .limit(4);
  if (error) throw error;
  return data as Product[];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase.from("testimonials").select("*");
  if (error) throw error;
  return data as Testimonial[];
}
