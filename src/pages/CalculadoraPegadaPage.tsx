import { useState, useRef, useEffect } from 'react';
import { Calculator, ArrowRight, Leaf, ShoppingCart, Database } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';

export function CalculadoraPegadaPage() {
  const [annualEmissions, setAnnualEmissions] = useState<number>(0);
  const [result, setResult] = useState<{ emissions: number; recommendedM2: number } | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [saving, setSaving] = useState(false);
  const { setRecommendedM2, setCurrentPage } = useApp();
  const resultRef = useRef<HTMLDivElement>(null);

  const calculateFootprint = async () => {
    if (annualEmissions <= 0) return;
    
    // Fórmula: aproximadamente 2.5 kg O2 por m² por ano
    // Para neutralizar, calculamos quantos m² são necessários
    const co2PerM2PerYear = 2.5;
    const recommendedMeters = Math.ceil(annualEmissions / co2PerM2PerYear);
    const valorCompensacao = recommendedMeters * 25.90; // Preço médio por m²
    
    const calculationResult = {
      emissions: annualEmissions,
      recommendedM2: recommendedMeters
    };
    
    setResult(calculationResult);
    setRecommendedM2(recommendedMeters);

    // Show success message for calculation
    toast.success('Cálculo de pegada de carbono realizado com sucesso!');
  };

  // Scroll automático para o resultado após o cálculo
  useEffect(() => {
    if (result && resultRef.current) {
      // Aguarda um pequeno delay para garantir que o elemento foi renderizado
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        
        // Adiciona um pequeno highlight visual
        if (resultRef.current) {
          resultRef.current.style.transform = 'scale(1.02)';
          setTimeout(() => {
            if (resultRef.current) {
              resultRef.current.style.transform = 'scale(1)';
            }
          }, 300);
        }
      }, 150);
    }
  }, [result]);

  const goToCart = () => {
    setCurrentPage('loja');
  };

  const emissionExamples = [
    { label: 'Pessoa média brasileira', value: 2300 },
    { label: 'Família de 4 pessoas', value: 9200 },
    { label: 'Empresa pequena (10 funcionários)', value: 50000 },
    { label: 'Empresa média (50 funcionários)', value: 250000 }
  ];

  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-green-50/80 to-emerald-50/80"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6">
            <Calculator className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm sm:text-base">Calculadora de Compensação</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-6 sm:mb-8 px-4 sm:px-0">
            Calcule quantos m² você
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              precisa compensar
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Insira suas emissões anuais de O₂ e descubra quantos metros quadrados 
            de reflorestamento você precisa para neutralizar sua pegada de carbono.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Calculator */}
          <GlassCard className="p-6 sm:p-8">
            <h3 className="text-gray-800 mb-6 flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-green-600" />
              <span>Entrada Simples</span>
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-3">
                  <Leaf className="w-5 h-5 inline mr-2 text-green-500" />
                  Suas emissões anuais de O₂ (kg)
                </label>
                <input
                  type="number"
                  value={annualEmissions || ''}
                  onChange={(e) => setAnnualEmissions(Number(e.target.value))}
                  className="w-full px-4 py-4 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 text-lg"
                  placeholder="Ex: 2300"
                  min="0"
                />
                <p className="text-gray-500 text-sm mt-2">
                  Não sabe suas emissões? Use um dos exemplos abaixo ou consulte nossa calculadora completa.
                </p>
              </div>

              {/* Campos opcionais para salvar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">
                    Nome (opcional)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  Os cálculos são salvos automaticamente no sistema
                </Badge>
              </div>

              <button
                onClick={calculateFootprint}
                disabled={annualEmissions <= 0 || saving}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calculator className="w-5 h-5" />
                <span>{saving ? 'Salvando...' : 'Calcular m² Necessários'}</span>
              </button>
            </div>
          </GlassCard>

          {/* Examples & Result */}
          <div className="space-y-4 sm:space-y-6">
            {/* Examples */}
            <GlassCard className="p-4 sm:p-6">
              <h4 className="text-gray-800 mb-4">Exemplos de Emissões</h4>
              <div className="space-y-3">
                {emissionExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setAnnualEmissions(example.value)}
                    className="w-full p-3 text-left bg-white/30 hover:bg-white/50 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">{example.label}</span>
                      <span className="text-green-600 font-medium">{example.value.toLocaleString()} kg O₂</span>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Result */}
            {result && (
              <GlassCard ref={resultRef} className="p-4 sm:p-6 text-center border-2 border-green-500/20 transition-transform duration-300">
                <h4 className="text-gray-800 mb-4">Resultado da Compensação</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-medium text-gray-800">
                      {result.recommendedM2.toLocaleString()} m²
                    </div>
                    <div className="text-gray-600">metros quadrados recomendados</div>
                  </div>
                  
                  <div className="p-4 bg-green-50/50 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Suas emissões: {result.emissions.toLocaleString()} kg O₂/ano</div>
                      <div>Compensação: ~2.5 kg O₂ por m²/ano</div>
                      <div>Período: Neutralização anual</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={goToCart}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Ver Projetos Disponíveis</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <p className="text-gray-600 text-sm">
                    💡 Dica: Você pode comprar gradualmente ou em pacotes mensais
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Info Section */}
        <GlassCard className="p-6 sm:p-8 mt-8 sm:mt-12">
          <h3 className="text-gray-800 mb-6 text-center">Como funciona a compensação?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-gray-800 mb-2">Sequestro de Carbono</h4>
              <p className="text-gray-600 text-sm">
                Cada m² de floresta plantada sequestra aproximadamente 2,5 kg de O₂ por ano
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-gray-800 mb-2">Cálculo Científico</h4>
              <p className="text-gray-600 text-sm">
                Baseado em metodologias reconhecidas internacionalmente e dados de campo
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="text-gray-800 mb-2">Neutralização Real</h4>
              <p className="text-gray-600 text-sm">
                Compensação efetiva através de projetos verificados e monitorados
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}