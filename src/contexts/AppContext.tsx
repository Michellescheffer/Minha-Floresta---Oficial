import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface SocialProject {
  id: string;
  title: string;
  description: string;
  category: 'education' | 'community' | 'research' | 'partnership';
  location: string;
  startDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  budget: number;
  spent: number;
  beneficiaries: number;
  partners: string[];
  objectives: string[];
  results: string[];
  images: string[];
  coordinator: string;
  contactEmail: string;
  reports: Array<{
    title: string;
    date: string;
    url: string;
  }>;
  donationsReceived: number;
  donationGoal: number;
  allowDonations: boolean;
}

export interface Sale {
  id: string;
  customerId: string;
  projectId: string;
  m2Purchased: number;
  totalValue: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  totalPurchases: number;
  totalM2: number;
  registrationDate: string;
}

export type PageType = 
  | 'home' 
  | 'como-funciona' 
  | 'sobre-projeto' 
  | 'certificado' 
  | 'verificar-certificado'
  | 'visualizar-certificado'
  | 'verificar-doacao'
  | 'informacoes-institucionais'
  | 'loja' 
  | 'doacoes' 
  | 'projetos-sociais' 
  | 'incentivo-fiscal' 
  | 'calculadora-pegada' 
  | 'carrinho' 
  | 'contato' 
  | 'blue-carbon'
  | 'dashboard'
  | 'cms'
  | 'cleanup-test'
  | 'checkout-success'
  | 'checkout-cancel'
  | 'checkout-return';

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  available: number;
  sold: number;
  image: string;
  type: string;
  status: string;
}

export interface CartItem {
  id: string;
  projectId: string;
  projectName: string;
  m2Quantity: number;
  price_per_m2: number;
  image: string;
}

 

interface AppContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, m2Quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  total_m2: number;
  recommendedM2: number;
  setRecommendedM2: (m2: number) => void;
  // Social Projects
  socialProjects: SocialProject[];
  selectedDonationProject: SocialProject | null;
  setSelectedDonationProject: (project: SocialProject | null) => void;
  addDonation: (projectId: string, amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const ENABLE_REMOTE_CART = false;
  const hashToPage = useCallback((hash: string): PageType => {
    const h = (hash || '').replace(/^#/, '').trim();
    // Ignorar querystring ao mapear a página (ex.: 'checkout-success?session_id=...' => 'checkout-success')
    const path = h.split('?')[0] || '';
    const map: Record<string, PageType> = {
      'home': 'home',
      'como-funciona': 'como-funciona',
      'sobre-projeto': 'sobre-projeto',
      'certificado': 'certificado',
      'verificar-certificado': 'verificar-certificado',
      'visualizar-certificado': 'visualizar-certificado',
      'informacoes-institucionais': 'informacoes-institucionais',
      'loja': 'loja',
      'doacoes': 'doacoes',
      'projetos-sociais': 'projetos-sociais',
      'incentivo-fiscal': 'incentivo-fiscal',
      // manter compat com links antigos '#calculadora'
      'calculadora': 'calculadora-pegada',
      'calculadora-pegada': 'calculadora-pegada',
      'carrinho': 'carrinho',
      'contato': 'contato',
      'blue-carbon': 'blue-carbon',
      'dashboard': 'dashboard',
      'cms': 'cms',
      'checkout-success': 'checkout-success',
      'checkout-cancel': 'checkout-cancel',
      'checkout-return': 'checkout-return',
    };
    return map[path] || 'home';
  }, []);

  const pageToHash = useCallback((page: PageType): string => {
    const map: Partial<Record<PageType, string>> = {
      'calculadora-pegada': 'calculadora', // preferir hash curto
    };
    return `#${map[page] || page}`;
  }, []);

  const [currentPage, _setCurrentPage] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      return hashToPage(window.location.hash);
    }
    return 'home';
  });

  const setCurrentPage = useCallback((page: PageType) => {
    _setCurrentPage(page);
    if (typeof window !== 'undefined') {
      const newHash = pageToHash(page);
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
      // garantir scroll top para páginas de seção longa
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pageToHash]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recommendedM2, setRecommendedM2] = useState<number>(0);
  const [socialProjects, setSocialProjects] = useState<SocialProject[]>([]);
  const [selectedDonationProject, setSelectedDonationProject] = useState<SocialProject | null>(null);

  // Load donation projects from Supabase
  useEffect(() => {
    const loadDonationProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('donation_projects')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading donation projects:', error);
          return;
        }

        if (data && data.length > 0) {
          const mapped: SocialProject[] = data.map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            category: project.category || 'community',
            location: project.location || '',
            startDate: project.start_date || new Date().toISOString(),
            status: project.status || 'active',
            budget: project.goal_amount || 0,
            spent: project.current_amount || 0,
            beneficiaries: project.beneficiaries_count || 0,
            partners: project.partners ? JSON.parse(project.partners) : [],
            objectives: project.objectives ? JSON.parse(project.objectives) : [],
            results: project.results ? JSON.parse(project.results) : [],
            images: project.image_url ? [project.image_url] : [],
            coordinator: project.coordinator || '',
            contactEmail: project.contact_email || '',
            reports: [],
            donationsReceived: project.current_amount || 0,
            donationGoal: project.goal_amount || 0,
            allowDonations: true
          }));
          setSocialProjects(mapped);
        }
      } catch (err) {
        console.error('Error loading donation projects:', err);
      }
    };

    loadDonationProjects();
  }, []);

  useEffect(() => {
    // sincronizar ao mudar o hash manualmente ou via histórico
    const onHashChange = () => {
      const next = hashToPage(window.location.hash);
      _setCurrentPage(prev => (prev === next ? prev : next));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [hashToPage]);

  useEffect(() => {
    const loadCart = async () => {
      if (!ENABLE_REMOTE_CART) return;
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        const userId = userData.user.id;
        const { data, error } = await supabase
          .from('cart_items')
          .select('id, project_id, area_sqm, price_per_sqm, updated_at')
          .eq('user_id', userId);
        if (error || !data) return;
        const mapped: CartItem[] = data.map((row) => ({
          id: String(row.id),
          projectId: String(row.project_id),
          projectName: 'Projeto',
          m2Quantity: Number(row.area_sqm || 0),
          price_per_m2: Number(row.price_per_sqm || 0),
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        }));
        if (mapped.length > 0) setCartItems(mapped);
      } catch {}
    };
    loadCart();
  }, []);

  const syncUpsertCartItem = async (projectId: string, m2Quantity: number, pricePerM2: number) => {
    if (!ENABLE_REMOTE_CART) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;
      await supabase
        .from('cart_items')
        .upsert(
          {
            user_id: userId,
            project_id: projectId,
            area_sqm: m2Quantity,
            price_per_sqm: pricePerM2,
          },
          { onConflict: 'user_id,project_id' }
        );
    } catch {}
  };

  const syncDeleteCartItem = async (projectId: string) => {
    if (!ENABLE_REMOTE_CART) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId);
    } catch {}
  };

  const syncClearCart = async () => {
    if (!ENABLE_REMOTE_CART) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
    } catch {}
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.projectId === item.projectId);
      if (existingItem) {
        const updated = prev.map(cartItem =>
          cartItem.projectId === item.projectId
            ? { ...cartItem, m2Quantity: cartItem.m2Quantity + item.m2Quantity }
            : cartItem
        );
        syncUpsertCartItem(item.projectId, (existingItem.m2Quantity + item.m2Quantity), item.price_per_m2);
        return updated;
      }
      const newItem = { ...item, id: Date.now().toString() };
      syncUpsertCartItem(item.projectId, item.m2Quantity, item.price_per_m2);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => {
      const toRemove = prev.find(i => i.id === id);
      if (toRemove) syncDeleteCartItem(toRemove.projectId);
      return prev.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: string, m2Quantity: number) => {
    if (m2Quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, m2Quantity } : item);
      const target = updated.find(i => i.id === id);
      if (target) syncUpsertCartItem(target.projectId, target.m2Quantity, target.price_per_m2);
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    syncClearCart();
  };

  const addDonation = (projectId: string, amount: number) => {
    setSocialProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, donationsReceived: project.donationsReceived + amount }
          : project
      )
    );
  };

  const totalItems = cartItems.length;
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price_per_m2 * item.m2Quantity, 0);
  const total_m2 = cartItems.reduce((sum, item) => sum + item.m2Quantity, 0);

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      total_m2,
      recommendedM2,
      setRecommendedM2,
      socialProjects,
      selectedDonationProject,
      setSelectedDonationProject,
      addDonation
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}