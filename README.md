# Delicious Bakers - Bakery Website with Supabase Backend

A full-stack bakery website built with React, TypeScript, Tailwind CSS, and Supabase, featuring a complete e-commerce experience and admin panel.

## 🚀 Features

- **Frontend (React + TypeScript + Tailwind + ShadCN UI)**
  - Responsive product listings with category filters
  - Shopping cart functionality with local state management
  - Beautiful, mobile-first UI with bakery-themed design
  - Product cards with hover effects and animations
  - Toast notifications for user feedback

- **Backend (Supabase)**
  - Product database with CRUD operations
  - Image storage for product photos
  - Authentication system for admin access
  - Real-time data updates

- **Admin Panel**
  - Secure login with Supabase Auth
  - Full product management (Create, Read, Update, Delete)
  - Image upload and management
  - Protected routes for admin access

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, ShadCN UI components
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: React Context API + useReducer
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Routing**: React Router DOM

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env` file in the root directory:
     ```env
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

3. **Set up the database**
   Create the products table in your Supabase SQL editor:
   ```sql
   -- Create products table
   CREATE TABLE products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10,2) NOT NULL,
     image_url TEXT,
     category TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Insert sample products
   INSERT INTO products (name, description, price, category) VALUES
   ('Chocolate Cake', 'Rich and moist chocolate cake with creamy frosting', 29.99, 'Cakes'),
   ('Vanilla Cupcakes', 'Light and fluffy vanilla cupcakes with buttercream', 3.99, 'Cupcakes'),
   ('Fudge Brownies', 'Dense and fudgy brownies with chocolate chips', 4.99, 'Brownies'),
   ('Chocolate Chip Cookies', 'Classic cookies with premium chocolate chips', 2.99, 'Cookies'),
   ('Artisan Sourdough', 'Traditional sourdough bread baked fresh daily', 6.99, 'Breads'),
   ('Red Velvet Cake', 'Classic red velvet with cream cheese frosting', 34.99, 'Cakes');
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

The project uses a custom bakery-themed design system:

- **Colors**: Warm browns, creams, and gold tones
- **Typography**: Playfair Display for headings, Inter for body text
- **Components**: Built with ShadCN UI and customized for bakery theme
- **Animations**: Subtle hover effects and floating animations

## 🚀 Next Steps

1. Set up your Supabase project and add your credentials to `.env`
2. Run the SQL commands to create the products table
3. Start the development server and explore the application
4. Customize the design and add your own bakery products
5. Implement the admin panel with Supabase Auth
6. Deploy to your preferred hosting platform

---

**Happy Baking! 🧁**
