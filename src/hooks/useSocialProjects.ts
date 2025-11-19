import { useState, useEffect } from 'react';
import { useApp, SocialProject } from '../contexts/AppContext';

export function useSocialProjects() {
  const { socialProjects } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ENABLE_SOCIAL_MOCKS = import.meta.env?.VITE_ENABLE_SOCIAL_MOCKS === 'true';

  // Mock data de projetos sociais para demonstração
  const adminExampleProjects: SocialProject[] = [
    {
      id: 'admin-social-1',
      title: 'Rede de Escolas Agroflorestais',
      description: 'Implantação de unidades demonstrativas em escolas públicas rurais para regenerar solo e garantir merenda escolar saudável.',
      category: 'education',
      location: 'Chapada dos Veadeiros - GO',
      startDate: '2025-01-10',
      status: 'active',
      budget: 98000,
      spent: 21500,
      beneficiaries: 420,
      partners: ['Secretaria Municipal de Educação', 'Instituto Cerrado Vivo'],
      objectives: [
        'Construir 6 canteiros agroflorestais',
        'Capacitar 40 professores',
        'Incorporar hortas no currículo local'
      ],
      results: ['2 canteiros implantados', '12 professores certificados'],
      images: ['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&auto=format'],
      coordinator: 'Renata Lobo',
      contactEmail: 'renata@florestaviva.org',
      reports: [],
      donationsReceived: 21500,
      donationGoal: 98000,
      allowDonations: true
    },
    {
      id: 'admin-social-2',
      title: 'Guardiões dos Manguezais',
      description: 'Plano comunitário para restaurar manguezais degradados e garantir renda a pescadores artesanais.',
      category: 'community',
      location: 'Bahia de Todos-os-Santos - BA',
      startDate: '2025-02-05',
      status: 'active',
      budget: 145000,
      spent: 37500,
      beneficiaries: 95,
      partners: ['Associação de Pescadores locais', 'Universidade Federal da Bahia'],
      objectives: ['Recuperar 35 hectares de mangue', 'Formar cooperativa de biojóias', 'Instalar viveiro de mudas nativas'],
      results: ['Viveiro construído', 'Primeira cooperativa com 22 mulheres'],
      images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format'],
      coordinator: 'Carlos Porto',
      contactEmail: 'carlos@manguezalvivo.org',
      reports: [],
      donationsReceived: 37500,
      donationGoal: 145000,
      allowDonations: true
    },
    {
      id: 'admin-social-3',
      title: 'Observatório da Água no Semiárido',
      description: 'Instalação de cisternas inteligentes e monitoramento comunitário da qualidade da água em 12 municípios.',
      category: 'research',
      location: 'Cariri Paraibano - PB',
      startDate: '2024-11-20',
      status: 'active',
      budget: 120000,
      spent: 64200,
      beneficiaries: 1800,
      partners: ['ASA Brasil', 'Universidade Federal de Campina Grande'],
      objectives: ['Construir 120 cisternas', 'Treinar 60 agentes comunitários', 'Implementar plataforma de dados abertos'],
      results: ['55 cisternas concluídas', 'Plataforma beta no ar'],
      images: ['https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format'],
      coordinator: 'Fabrícia Nóbrega',
      contactEmail: 'fabricia@observatorioagua.org',
      reports: [],
      donationsReceived: 64200,
      donationGoal: 120000,
      allowDonations: true
    },
    {
      id: 'admin-social-4',
      title: 'Turismo Regenerativo Caiçara',
      description: 'Estruturação de roteiros de turismo de base comunitária para financiar a proteção da restinga e da cultura caiçara.',
      category: 'community',
      location: 'Litoral Norte de SP',
      startDate: '2025-03-01',
      status: 'active',
      budget: 88000,
      spent: 15000,
      beneficiaries: 60,
      partners: ['Associação Caiçara da Jureia', 'SEBRAE-SP'],
      objectives: ['Criar 4 roteiros certificados', 'Treinar 30 guias locais', 'Implantar centro de visitantes'],
      results: ['Manual de roteiros concluído', '15 guias em treinamento'],
      images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format'],
      coordinator: 'Nayara Prado',
      contactEmail: 'nayara@turismoregenerativo.org',
      reports: [],
      donationsReceived: 15000,
      donationGoal: 88000,
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
  const projectsToUse = (socialProjects && socialProjects.length > 0)
    ? socialProjects
    : ENABLE_SOCIAL_MOCKS
      ? mockSocialProjects
      : [];

  return {
    socialProjects: projectsToUse,
    isLoading,
    error
  };
}