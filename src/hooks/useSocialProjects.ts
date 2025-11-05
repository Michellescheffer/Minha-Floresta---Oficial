import { useState, useEffect } from 'react';
import { useApp, SocialProject } from '../contexts/AppContext';

export function useSocialProjects() {
  const { socialProjects } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data de projetos sociais para demonstração
  const mockSocialProjects: SocialProject[] = [
    {
      id: 'social-1',
      title: 'Educação Ambiental Comunitária',
      description: 'Programa de educação ambiental para comunidades rurais, focando em práticas sustentáveis e conservação da biodiversidade local.',
      category: 'education',
      location: 'Interior de São Paulo',
      startDate: '2024-01-15',
      status: 'active',
      budget: 85000,
      spent: 42500,
      beneficiaries: 350,
      partners: ['Secretaria de Educação', 'Instituto Verde'],
      objectives: [
        'Capacitar 300 pessoas em práticas sustentáveis',
        'Implementar 5 hortas comunitárias',
        'Formar 20 multiplicadores ambientais'
      ],
      results: [
        '180 pessoas já capacitadas',
        '3 hortas comunitárias implementadas',
        '12 multiplicadores formados'
      ],
      images: [
        'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'
      ],
      coordinator: 'Maria Silva',
      contactEmail: 'maria@educacaoambiental.org',
      reports: [
        {
          title: 'Relatório Trimestral Q1 2024',
          date: '2024-03-01',
          url: '#'
        }
      ],
      donationsReceived: 12500,
      donationGoal: 25000,
      allowDonations: true
    },
    {
      id: 'social-2',
      title: 'Reflorestamento Participativo',
      description: 'Projeto que envolve comunidades locais no plantio e cuidado de mudas nativas, gerando renda e restaurando ecossistemas.',
      category: 'community',
      location: 'Mata Atlântica - RJ',
      startDate: '2024-02-01',
      status: 'active',
      budget: 120000,
      spent: 65000,
      beneficiaries: 80,
      partners: ['Prefeitura Local', 'ONG Mata Viva'],
      objectives: [
        'Plantar 10.000 mudas nativas',
        'Gerar renda para 80 famílias',
        'Restaurar 50 hectares de mata'
      ],
      results: [
        '6.500 mudas plantadas',
        '52 famílias beneficiadas',
        '32 hectares em restauração'
      ],
      images: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        'https://images.unsplash.com/photo-1574263867128-f70bb67c3be6?w=400'
      ],
      coordinator: 'João Santos',
      contactEmail: 'joao@reflorestamento.org',
      reports: [
        {
          title: 'Relatório de Progresso Março',
          date: '2024-03-15',
          url: '#'
        }
      ],
      donationsReceived: 8700,
      donationGoal: 30000,
      allowDonations: true
    },
    {
      id: 'social-3',
      title: 'Pesquisa de Biodiversidade Urbana',
      description: 'Estudo científico da biodiversidade em ambientes urbanos para orientar políticas públicas de conservação.',
      category: 'research',
      location: 'São Paulo - SP',
      startDate: '2024-01-01',
      status: 'active',
      budget: 150000,
      spent: 89000,
      beneficiaries: 2500000,
      partners: ['USP', 'Prefeitura de São Paulo', 'ICMBio'],
      objectives: [
        'Mapear espécies nativas urbanas',
        'Desenvolver índice de biodiversidade urbana',
        'Criar diretrizes para gestão urbana sustentável'
      ],
      results: [
        '450 espécies catalogadas',
        'Metodologia de índice desenvolvida',
        '3 artigos científicos publicados'
      ],
      images: [
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      ],
      coordinator: 'Dr. Ana Costa',
      contactEmail: 'ana@pesquisaurbana.org',
      reports: [
        {
          title: 'Relatório Científico Q1',
          date: '2024-03-20',
          url: '#'
        }
      ],
      donationsReceived: 15600,
      donationGoal: 40000,
      allowDonations: true
    }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // Se não há projetos sociais no contexto, usar os dados mock
  const projectsToUse = (socialProjects && socialProjects.length > 0) ? socialProjects : mockSocialProjects;

  return {
    socialProjects: projectsToUse,
    isLoading,
    error
  };
}