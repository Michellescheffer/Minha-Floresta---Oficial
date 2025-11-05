import { useState, useEffect } from 'react';
import { UserAPI } from '../services/api';
import { apiRequest } from '../utils/database';

export interface CartItem {
  id: string;
  projectId: string;
  projectName: string;
  quantity: number;
  price: number;
  image: string;
}

// Local storage key
const CART_STORAGE_KEY = 'minha_floresta_cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart from API or localStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const currentUser = UserAPI.getCurrentUser();
      
      if (currentUser) {
        // Try to load from API
        const { data, error: apiError } = await apiRequest<any[]>('/shopping-cart', {
          headers: {
            'Authorization': `Bearer ${UserAPI.getAuthToken()}`
          }
        });
        
        if (data && !apiError) {
          // Transform API data to cart items
          const cartItems = data.map(item => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.project_name || 'Projeto',
            quantity: item.quantity,
            price: item.price || 0,
            image: item.image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
          }));
          
          setItems(cartItems);
          // Sync with localStorage
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } else {
          // Fallback to localStorage
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setItems(parsedCart);
            // Try to sync localStorage cart to API
            syncCartToAPI(parsedCart);
          }
        }
      } else {
        // No user, load from localStorage
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        }
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Erro ao carregar carrinho');
      
      // Fallback to localStorage
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const syncCartToAPI = async (cartItems: CartItem[]) => {
    const currentUser = UserAPI.getCurrentUser();
    if (!currentUser) return;

    try {
      for (const item of cartItems) {
        await apiRequest('/shopping-cart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${UserAPI.getAuthToken()}`
          },
          body: JSON.stringify({
            project_id: item.projectId,
            quantity: item.quantity
          })
        });
      }
    } catch (error) {
      console.error('Error syncing cart to API:', error);
    }
  };

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [items]);

  const addItem = async (projectId: string, projectName: string, quantity: number, price: number, image: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const existingItemIndex = items.findIndex(item => item.projectId === projectId);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += quantity;
        setItems(updatedItems);
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          projectName,
          quantity,
          price,
          image
        };
        setItems(prev => [...prev, newItem]);
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('Erro ao adicionar item ao carrinho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);

      if (quantity <= 0) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        ));
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Erro ao atualizar item do carrinho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('Erro ao remover item do carrinho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Erro ao limpar carrinho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount
  };
}