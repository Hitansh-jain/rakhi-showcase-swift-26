import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  discount: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface FilterOptions {
  category: string;
  search: string;
  minPrice: number;
  maxPrice: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const filterProducts = (filters: FilterOptions): Product[] => {
    const filtered = products.filter(product => {
      // Category filter
      if (filters.category !== 'All' && product.category !== filters.category) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!product.name.toLowerCase().includes(searchLower) && 
            !product.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Price filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });

    // Priority products to show at the top
    const priorityProducts = [
      'Real Kundan Rakhi',
      'Full Diamond Rakhi', 
      'Silver Rakhi',
      'Full Kundan Rakhi',
      'Pan Rakhi',
      'Rakhi with Kum Kum'
    ];

    // Separate priority and regular products
    const priority: Product[] = [];
    const regular: Product[] = [];

    filtered.forEach(product => {
      const isPriority = priorityProducts.some(name => 
        product.name.toLowerCase().includes(name.toLowerCase())
      );
      
      if (isPriority) {
        priority.push(product);
      } else {
        regular.push(product);
      }
    });

    // Sort priority products by the order defined in priorityProducts array
    priority.sort((a, b) => {
      const aIndex = priorityProducts.findIndex(name => 
        a.name.toLowerCase().includes(name.toLowerCase())
      );
      const bIndex = priorityProducts.findIndex(name => 
        b.name.toLowerCase().includes(name.toLowerCase())
      );
      return aIndex - bIndex;
    });

    // Return priority products first, then regular products
    return [...priority, ...regular];
  };

  return {
    products,
    categories,
    loading,
    error,
    filterProducts,
    refetchProducts: fetchProducts,
    refetchCategories: fetchCategories
  };
};