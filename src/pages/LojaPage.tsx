import { Search, Filter, MapPin, Award, Plus, Minus, Leaf, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { useProjects, type Project } from '../hooks/useProjects';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function LojaPage() {
  const { addToCart } = useApp();
  const { projects, isLoading, error, refreshProjects } = useProjects();
  const [selectedType, setSelectedType] = useState('todos');
  const [priceRange, setPriceRange] = useState('todos');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [m2Quantities, setM2Quantities] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Check if coming from Blue Carbon page
  useEffect(() => {
    const blueCarbon = sessionStorage.getItem('blueCarbon-filter');
    if (blueCarbon === 'true') {
      setSelectedType('blue-carbon');
      sessionStorage.removeItem('blueCarbon-filter');
    }
  }, []);

  // Dados reais do backend
  const projectsData = projects || [];

  const types = [
    { id: 'todos', label: 'Todos os tipos' },
    { id: 'reforestation', label: 'Reflorestamento' },
    { id: 'restoration', label: 'Restauração' },
    { id: 'blue-carbon', label: 'Blue Carbon' },
    { id: 'conservation', label: 'Conservação' }
  ];
  const priceRanges = [
    { id: 'todos', label: 'Todos os preços' },
    { id: '0-10', label: 'Até R$ 10/m²' },
    { id: '10-15', label: 'R$ 10 - R$ 15/m²' },
    { id: '15+', label: 'Acima de R$ 15/m²' }
  ];

  const filteredProjects = projectsData.filter(project => {
    // Filter by project type
    let matchesType = false;
    if (selectedType === 'todos') {
      matchesType = true;
    } else {
      matchesType = project.type === selectedType;
    }

    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPrice = true;
    if (priceRange !== 'todos') {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
      if (max) {
        matchesPrice = (project.price || 0) >= Number(min) && (project.price || 0) <= Number(max);
      } else {
        matchesPrice = (project.price || 0) >= Number(min);
      }
    }
    
    return matchesType && matchesSearch && matchesPrice;
  });

  const updateM2Quantity = (projectId: string, quantity: number) => {
    setM2Quantities(prev => ({
      ...prev,
      [projectId]: Math.max(1, quantity)
    }));
  };

  const handleAddToCart = (project: Project) => {
    const quantity = m2Quantities[project.id] || 100;
    
    // Check if quantity is within available limits
    if (quantity > (project.available || 0)) {
      toast.error(`Apenas ${project.available || 0} m² disponíveis para este projeto`);
      return;
    }
    
    addToCart({
      projectId: project.id,
      projectName: project.name,
      m2Quantity: quantity,
      price_per_m2: project.price || 0,
      image: project.image
    });
    
    // Show success feedback
    toast.success(`${quantity} m² de "${project.name}" adicionados ao carrinho!`, {
      description: `Valor: R$ ${(quantity * (project.price || 0)).toFixed(2)}`
    });
    
    // Reset quantity after adding
    setM2Quantities(prev => ({ ...prev, [project.id]: 100 }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen page-content">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/20">
              <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              <span className="text-gray-700">Carregando projetos verificados...</span>
            </div>
            
            {/* Loading skeleton cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <GlassCard key={item} className="overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200/50"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200/50 rounded"></div>
                    <div className="h-4 bg-gray-200/50 rounded w-3/4"></div>
                    <div className="h-16 bg-gray-200/50 rounded"></div>
                    <div className="h-10 bg-gray-200/50 rounded"></div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen page-content">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-orange-50/80 to-yellow-50/80"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center py-20">
            <GlassCard className="max-w-md mx-auto p-8">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-gray-800 mb-2">Erro ao carregar projetos</h3>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <button
                onClick={refreshProjects}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
              >
                Tentar novamente
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-content">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-6">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Loja</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-6">
            Catálogo de
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Projetos Verificados
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {selectedType === 'blue-carbon' 
              ? 'Projetos especializados em manguezais e ecossistemas costeiros com superior capacidade de captura de carbono.'
              : 'Escolha entre nossos projetos certificados de reflorestamento e conservação. Compre por metro quadrado e faça a diferença hoje.'
            }
          </p>
          
          {/* Indicador de dados */}
          <div className="flex justify-center mt-6">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              <Leaf className="w-3 h-3 mr-1" />
              {projectsData.length} projetos disponíveis
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Tipo de Projeto</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Preço por m²</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                {priceRanges.map(range => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Certification */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Certificação</label>
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                selectedType === 'blue-carbon' 
                  ? 'bg-blue-50/50' 
                  : 'bg-green-50/50'
              }`}>
                <Award className={`w-5 h-5 ${
                  selectedType === 'blue-carbon' 
                    ? 'text-blue-600' 
                    : 'text-green-600'
                }`} />
                <span className={`text-sm ${
                  selectedType === 'blue-carbon' 
                    ? 'text-blue-700' 
                    : 'text-green-700'
                }`}>
                  {selectedType === 'blue-carbon' ? 'Blue Carbon Standard' : 'Projetos Verificados'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <GlassCard key={project.id} className="overflow-hidden group h-full flex flex-col">
              <div className="relative">
                <ImageWithFallback
                  src={project.image}
                  alt={project.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>Verificado</span>
                </div>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm ${
                  project.type === 'blue-carbon'
                    ? 'bg-blue-500/90 text-white'
                    : project.type === 'reforestation'
                    ? 'bg-green-500/90 text-white'
                    : 'bg-amber-500/90 text-white'
                }`}>
                  {project.type === 'blue-carbon' ? 'Blue Carbon' : 
                   project.type === 'reforestation' ? 'Reflorestamento' :
                   project.type === 'restoration' ? 'Restauração' : 
                   project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="text-gray-800 mb-2">{project.name}</h4>
                
                <div className="flex items-center space-x-1 text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Disponível:</span>
                    <span className="font-medium">{(project.available || 0).toLocaleString()} m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vendidos:</span>
                    <span className="font-medium text-green-600">{(project.sold || 0).toLocaleString()} m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço por m²:</span>
                    <span className="font-medium">R$ {(project.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Localização:</span>
                    <span className="font-medium text-xs">{project.location}</span>
                  </div>
                  
                  {/* Progress bar for availability */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progresso do projeto</span>
                      <span>{Math.round(((project.sold || 0) / ((project.available || 0) + (project.sold || 0))) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, ((project.sold || 0) / ((project.available || 0) + (project.sold || 0))) * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* M² Selector */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm">Quantidade de m²</label>
                  
                  {/* Quick selection buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[50, 100, 250, 500].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => updateM2Quantity(project.id, qty)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          (m2Quantities[project.id] || 100) === qty
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-white/50 text-gray-700 hover:bg-green-100 border border-white/20'
                        }`}
                      >
                        {qty}m²
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateM2Quantity(project.id, Math.max(1, (m2Quantities[project.id] || 100) - 50))}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                      disabled={(m2Quantities[project.id] || 100) <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <input
                      type="number"
                      value={m2Quantities[project.id] || 100}
                      onChange={(e) => updateM2Quantity(project.id, Math.max(1, Number(e.target.value)))}
                      className="flex-1 px-3 py-2 text-center bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      min="1"
                      step="1"
                    />
                    
                    <button
                      onClick={() => updateM2Quantity(project.id, Math.min((project.available || 0), (m2Quantities[project.id] || 100) + 50))}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                      disabled={(m2Quantities[project.id] || 100) >= (project.available || 0)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-600">
                      Quantidade: {(m2Quantities[project.id] || 100)} m²
                    </span>
                    <span className="font-medium text-gray-800">
                      Total: R$ {((m2Quantities[project.id] || 100) * (project.price || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() => handleAddToCart(project)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-center"
                  >
                    Adicionar {m2Quantities[project.id] || 100} m² ao Carrinho
                  </button>
                  
                  <button
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                    className="w-full border border-green-500/30 text-green-600 py-2 rounded-lg hover:bg-green-500/10 hover:border-green-500 transition-all duration-300 font-medium transform hover:scale-[1.02] active:scale-[0.98] text-center"
                  >
                    {selectedProject === project.id ? 'Ocultar Detalhes' : 'Ver Detalhes Completos'}
                  </button>
                </div>

                {/* Project Details */}
                {selectedProject === project.id && (
                  <div className="mt-4 p-4 bg-green-50/50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Relatórios Disponíveis:</h4>
                    <ul className="space-y-1">
                      {(project.reports || []).map((report, index) => (
                        <li key={report.id || index} className="text-sm text-gray-600 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{report.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600">Nenhum projeto encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}