import { useApp } from '../contexts/AppContext';
import { useEffect } from 'react';
import { Hero } from './Hero';
import { Benefits } from './Benefits';
import { CTA } from './CTA';
import { FeaturedProjects } from './FeaturedProjects';
import { LojaPage } from '../pages/LojaPage';
import { CalculadoraPegadaPage } from '../pages/CalculadoraPegadaPage';
import { CarrinhoPage } from '../pages/CarrinhoPage';
import { ComoFuncionaPage } from '../pages/ComoFuncionaPage';
import { DoacoesPage } from '../pages/DoacoesPage';
import { SobreProjetoPage } from '../pages/SobreProjetoPage';
import { VerificarCertificadoPage } from '../pages/VerificarCertificadoPage';
import { ProjetosSociaisPage } from '../pages/ProjetosSociaisPage';
import { ContatoPage } from '../pages/ContatoPage';
import { BlueCarbonPage } from '../pages/BlueCarbonPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CMSPage } from '../pages/CMSPage';
import { CleanupTestPage } from '../pages/CleanupTestPage';
import CheckoutSuccessPage from '../pages/CheckoutSuccessPage';
import CheckoutCancelPage from '../pages/CheckoutCancelPage';


// Páginas simples restantes
function CertificadoPage() {
  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-green-50/80 to-emerald-50/80"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-gray-800 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600">
              Certificados
            </span>
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Seus certificados de compensação de carbono com validade e transparência garantidas.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Certificação Física</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Documento oficial enviado pelos Correios</li>
              <li>• Papel certificado com marca d'água</li>
              <li>• QR Code para verificação digital</li>
              <li>• ID único rastreável</li>
            </ul>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Certificação Digital</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Disponível imediatamente após compra</li>
              <li>• Cadastro automático em blockchain</li>
              <li>• Download em PDF protegido</li>
              <li>• Verificação online 24/7</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function InformacoesInstitucionaisPage() {
  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-gray-50/80 to-green-50/80"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-gray-800 mb-6">
            Informações
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Institucionais
            </span>
          </h1>
        </div>
        
        <div className="space-y-8">
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Quem Somos</h3>
            <p className="text-gray-600 leading-relaxed">
              A Minha Floresta Conservações é uma plataforma inovadora que conecta pessoas e empresas com projetos 
              de reflorestamento verificados, democratizando o acesso à compensação de carbono.
            </p>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Missão</h3>
            <p className="text-gray-600 leading-relaxed">
              Facilitar a compensação de carbono através de projetos transparentes e verificados, 
              contribuindo para um futuro mais sustentável e consciente.
            </p>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Valores</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Transparência total em todos os processos</li>
              <li>• Verificação rigorosa por terceiros</li>
              <li>• Impacto ambiental real e mensurável</li>
              <li>• Democratização do acesso à sustentabilidade</li>
            </ul>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Políticas e Termos</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Política de Privacidade</li>
              <li>• Termos de Uso</li>
              <li>• Política de Reembolso</li>
              <li>• Código de Conduta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



function IncentivoFiscalPage() {
  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-green-50/80 to-emerald-50/80"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-gray-800 mb-6">
            Incentivo Fiscal
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              (Imposto de Renda)
            </span>
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Aproveite benefícios fiscais para investimentos em sustentabilidade
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Legislação Aplicável</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Lei 12.651/2012 (Código Florestal)</li>
              <li>• Lei 9.985/2000 (Sistema Nacional de Unidades de Conservação)</li>
              <li>• Instrução Normativa RFB nº 1.131/2011</li>
              <li>• Decreto 9.580/2018 (Regulamentação do Imposto de Renda)</li>
            </ul>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Aplicabilidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-gray-800 mb-2">Pessoa Física</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Dedução até 6% da renda bruta anual</li>
                  <li>• Doações para projetos ambientais</li>
                  <li>• Fundo de defesa de direitos difusos</li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-800 mb-2">Pessoa Jurídica</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Dedução até 2% do lucro operacional</li>
                  <li>• Investimentos em projetos de carbono</li>
                  <li>• Patrocínio a projetos socioambientais</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-black/5">
            <h3 className="text-gray-800 mb-4">Recibos e Documentação</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Emissão automática de recibo para dedução</li>
              <li>• Documentação completa para Receita Federal</li>
              <li>• Certificado de doação com CNPJ da entidade</li>
              <li>• Relatório anual de impacto para apresentação</li>
            </ul>
            
            <div className="mt-6 p-4 bg-green-50/50 rounded-lg">
              <p className="text-green-700 text-sm">
                💡 <strong>Dica:</strong> Mantenha todos os comprovantes organizados para 
                apresentar durante a declaração do Imposto de Renda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Homepage com seções mais completas
function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <Benefits />
      <CTA />
      
      {/* Seção removida - IndexedDB foi descontinuado na migração Supabase-only */}
    </>
  );
}

export function PageRouter() {
  const { currentPage } = useApp();

  // Scroll para o topo sempre que a página mudar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'como-funciona':
      return <ComoFuncionaPage />;
    case 'sobre-projeto':
      return <SobreProjetoPage />;
    case 'certificado':
      return <CertificadoPage />;
    case 'verificar-certificado':
      return <VerificarCertificadoPage />;
    case 'informacoes-institucionais':
      return <InformacoesInstitucionaisPage />;
    case 'loja':
      return <LojaPage />;

    case 'doacoes':
      return <DoacoesPage />;
    case 'projetos-sociais':
      return <ProjetosSociaisPage />;
    case 'incentivo-fiscal':
      return <IncentivoFiscalPage />;
    case 'calculadora-pegada':
      return <CalculadoraPegadaPage />;
    case 'carrinho':
      return <CarrinhoPage />;
    case 'contato':
      return <ContatoPage />;
    case 'blue-carbon':
      return <BlueCarbonPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'cms':
      return <CMSPage />;
    case 'cleanup-test':
      return <CleanupTestPage />;
    case 'checkout-success':
      return <CheckoutSuccessPage />;
    case 'checkout-cancel':
      return <CheckoutCancelPage />;
    default:
      return <HomePage />;
  }
}