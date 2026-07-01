// =============================================
// src/types/index.ts
// Type definitions untuk seluruh app
// =============================================

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number
  stock: number
  category_id: string
  image_url: string | null
  images: string[]
  sizes: string[]
  weight_gram: number
  is_active: boolean
  is_new: boolean
  categories?: Category
}

export type CartItem = {
  product: Product
  quantity: number
  size: string
}

export type Address = {
  id: string
  user_id: string
  label: string
  recipient_name: string
  phone: string
  street: string
  city: string
  province: string
  province_id: string
  postal_code: string
  is_default: boolean
}

export type Order = {
  id: string
  order_number: string
  user_id: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_cost: number
  total: number
  courier: string | null
  courier_service: string | null
  tracking_number: string | null
  estimated_days: string | null
  shipping_address: Address
  payment_status: 'unpaid' | 'paid' | 'refunded'
  created_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  size: string
  price: number
  quantity: number
  subtotal: number
}

export type OngkirResult = {
  courier: string
  service: string
  description: string
  cost: number
  etd: string
}
