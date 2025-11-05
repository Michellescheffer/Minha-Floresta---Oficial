import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  available: number;
  sold: number;
  image: string;
  images?: string[];
  type: string;
  status: string;
  coordinates?: { lat: number; lng: number };
}

// Mock data local (fallback)
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Amazônia Verde',
    description: 'Reflorestamento da Amazônia com espécies nativas, contribuindo para a preservação da maior floresta tropical do mundo.',
    location: 'Amazônia, Brasil',
    price: 25,
    available: 10000,
    sold: 2500,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    type: 'reforestation',
    status: 'active',
    coordinates: { lat: -3.4653, lng: -62.2159 }
  },
  {
    id: 'proj_2',
    name: 'Mata Atlântica Viva',
    description: 'Restauração da Mata Atlântica através do plantio de espécies endêmicas e proteção da biodiversidade.',
    location: 'São Paulo, Brasil',
    price: 30,
    available: 5000,
    sold: 1200,
    image: 'https://images.unsplash.com/photo-1574263867128-ca4c7707e1c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1574263867128-ca4c7707e1c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    type: 'restoration',
    status: 'active',
    coordinates: { lat: -23.5505, lng: -46.6333 }
  },
  {
    id: 'proj_3',
    name: 'Cerrado Sustentável',
    description: 'Conservação e reflorestamento do cerrado brasileiro com foco na preservação dos recursos hídricos.',
    location: 'Minas Gerais, Brasil',
    price: 20,
    available: 8000,
    sold: 3200,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    type: 'conservation',
    status: 'active',
    coordinates: { lat: -19.9167, lng: -43.9345 }
  },
  {
    id: 'proj_4',
    name: 'Mangue Azul',
    description: 'Proteção e restauração de manguezais, ecossistemas fundamentais para o equilíbrio marinho.',
    location: 'Bahia, Brasil',
    price: 35.00,
    available: 3000,
    sold: 800,
    image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800',
    images: ['https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800'],
    type: 'blue_carbon',
    status: 'active',
    coordinates: { lat: -12.9718, lng: -38.5014 }
  },
  {
    id: 'proj_5',
    name: 'Floresta Urbana',
    description: 'Criação de florestas urbanas para melhorar a qualidade do ar e a qualidade de vida nas cidades.',
    location: 'Rio de Janeiro, Brasil',
    price: 40.00,
    available: 2000,
    sold: 1500,
    image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800',
    images: ['https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800'],
    type: 'urban',
    status: 'active',
    coordinates: { lat: -22.9068, lng: -43.1729 }
  },
  {
    id: 'proj_6',
    name: 'Caatinga Resiliente',
    description: 'Recuperação da vegetação da caatinga e desenvolvimento de sistemas agroflorestais sustentáveis.',
    location: 'Pernambuco, Brasil',
    price: 18.00,
    available: 12000,
    sold: 4500,
    image: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800',
    images: ['https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800'],
    type: 'agroforestry',
    status: 'active',
    coordinates: { lat: -8.0476, lng: -34.8770 }
  }
];

export function useProjects() {
  const { supabase, isConnected } = useSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchProjects();
    }
  }, [isConnected]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Buscar projetos do Supabase
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        console.error('Error fetching projects:', supabaseError);
        setError(supabaseError.message);
        setProjects(MOCK_PROJECTS); // Fallback para mock data
        return;
      }
      
      if (data && data.length > 0) {
        // Transform Supabase data to frontend format
        const transformedProjects = data.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          location: project.location,
          type: project.type || 'reforestation',
          price: project.price_per_m2 || project.price || 25,
          available: project.available_area || 10000,
          sold: project.sold_area || 0,
          image: project.main_image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
          images: project.gallery_images || [project.main_image] || [],
          status: project.status,
          coordinates: project.coordinates || { lat: -15.7942, lng: -47.8822 }
        }));
        
        setProjects(transformedProjects);
      } else {
        // Use mock data as fallback
        setProjects(MOCK_PROJECTS);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
      setProjects(MOCK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectAvailability = async (projectId: string, purchasedArea: number) => {
    try {
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          available_area: supabase.raw(`available_area - ${purchasedArea}`),
          sold_area: supabase.raw(`sold_area + ${purchasedArea}`)
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Failed to update project availability:', updateError);
      }

      // Update local state immediately for better UX
      setProjects(prevProjects => {
        return prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              available: project.available - purchasedArea,
              sold: project.sold + purchasedArea
            };
          }
          return project;
        });
      });
    } catch (err) {
      console.error('Error updating project availability:', err);
      // Still update locally for offline capability
      setProjects(prevProjects => {
        return prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              available: project.available - purchasedArea,
              sold: project.sold + purchasedArea
            };
          }
          return project;
        });
      });
    }
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const refreshProjects = () => {
    return fetchProjects();
  };

  const getFeaturedProjects = (): Project[] => {
    return projects.slice(0, 3);
  };

  const getProjectsByType = (type: string): Project[] => {
    if (type === 'todos') return projects;
    return projects.filter(project => project.type === type);
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'coordinates' | 'status'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          location: projectData.location,
          type: projectData.type,
          price_per_m2: projectData.price,
          total_area: projectData.available,
          available_area: projectData.available,
          sold_area: projectData.sold || 0,
          main_image: projectData.image,
          gallery_images: projectData.images || [projectData.image],
          coordinates: { lat: -15.7942, lng: -47.8822 },
          status: 'active'
        })
        .select()
        .single();

      if (supabaseError) {
        console.error('Error creating project:', supabaseError);
        return { data: null, error: supabaseError.message };
      }

      if (data) {
        const newProject: Project = {
          id: data.id,
          name: data.name,
          description: data.description,
          location: data.location,
          type: data.type,
          price: data.price_per_m2,
          available: data.available_area,
          sold: data.sold_area,
          image: data.main_image,
          images: data.gallery_images,
          status: data.status,
          coordinates: data.coordinates
        };

        setProjects(prev => [...prev, newProject]);
        return { data: newProject, error: null };
      }

      return { data: null, error: 'Erro ao criar projeto' };
    } catch (err) {
      console.error('Error creating project:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro ao criar projeto' };
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.location) updateData.location = updates.location;
      if (updates.type) updateData.type = updates.type;
      if (updates.price) updateData.price_per_m2 = updates.price;
      if (updates.available !== undefined) updateData.available_area = updates.available;
      if (updates.sold !== undefined) updateData.sold_area = updates.sold;
      if (updates.image) updateData.main_image = updates.image;
      if (updates.images) updateData.gallery_images = updates.images;
      if (updates.status) updateData.status = updates.status;

      const { data, error: supabaseError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        console.error('Error updating project:', supabaseError);
        return { data: null, error: supabaseError.message };
      }

      if (data) {
        // Update local state
        setProjects(prev => prev.map(project => 
          project.id === id 
            ? {
                ...project,
                name: data.name,
                description: data.description,
                location: data.location,
                type: data.type,
                price: data.price_per_m2,
                available: data.available_area,
                sold: data.sold_area,
                image: data.main_image,
                images: data.gallery_images,
                status: data.status
              }
            : project
        ));
        return { data: true, error: null };
      }

      return { data: false, error: 'Erro ao atualizar projeto' };
    } catch (err) {
      console.error('Error updating project:', err);
      return { data: false, error: err instanceof Error ? err.message : 'Erro ao atualizar projeto' };
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        console.error('Error deleting project:', supabaseError);
        return { success: false, error: supabaseError.message };
      }

      // Remove from local state
      setProjects(prev => prev.filter(project => project.id !== id));
      return { success: true, error: null };
    } catch (err) {
      console.error('Error deleting project:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao deletar projeto' };
    }
  };

  return {
    projects,
    isLoading,
    error,
    isOnline: isConnected,
    refreshProjects,
    getFeaturedProjects,
    getProjectsByType,
    getProjectById,
    updateProjectAvailability,
    createProject,
    updateProject,
    deleteProject
  };
}