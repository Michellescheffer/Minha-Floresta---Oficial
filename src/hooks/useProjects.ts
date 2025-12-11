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
        setProjects([]);
        return;
      }

      if (data && data.length > 0) {
        // Transform Supabase data to frontend format (current schema)
        const transformedProjects = data.map(project => {
          const available = project.available_m2 ?? project.available_area ?? project.available ?? 0;
          const total = project.total_m2 ?? project.total_area ?? (available || 0);
          const sold = total && available ? Math.max(0, Number(total) - Number(available)) : (project.sold_area ?? project.sold ?? 0);
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            location: project.location,
            type: project.type || 'reforestation',
            price: project.price_per_m2 || project.price_per_sqm || project.price || 25,
            available: available || 0,
            sold,
            image: project.image || project.main_image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
            images: project.gallery_images || (project.image ? [project.image] : []),
            status: project.status,
            coordinates: project.coordinates || { lat: -15.7942, lng: -47.8822 }
          } as Project;
        });

        setProjects(transformedProjects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectAvailability = async (projectId: string, purchasedArea: number) => {
    try {
      // First fetch the current project to get latest values
      const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select('available_area, sold_area')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      if (!currentProject) throw new Error('Projeto não encontrado');

      const newAvailable = Math.max(0, (currentProject.available_area || 0) - purchasedArea);
      const newSold = (currentProject.sold_area || 0) + purchasedArea;

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          available_area: newAvailable,
          sold_area: newSold
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Failed to update project availability:', updateError);
        throw updateError;
      }

      // Update local state immediately for better UX
      setProjects(prevProjects => {
        return prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              available: newAvailable,
              sold: newSold
            };
          }
          return project;
        });
      });
    } catch (err) {
      console.error('Error updating project availability:', err);
      // Still update locally for offline capability if needed, or handle rollback
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
          total_m2: projectData.available,
          available_m2: projectData.available,
          image: projectData.image,
          gallery_images: projectData.images || [projectData.image],
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
          available: data.available_m2,
          sold: Math.max(0, (data.total_m2 ?? 0) - (data.available_m2 ?? 0)),
          image: data.image || data.main_image,
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