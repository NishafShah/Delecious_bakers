import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  image_url: string;
  ingredients: string;
  nutrition_info: string;
  in_stock: boolean;
  featured: boolean;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

export type Testimonial = {
  id: string;
  comment: string;
  customer_name: string;
  image_url: string;
  rating: number;
};

// Sample data fetching functions
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
