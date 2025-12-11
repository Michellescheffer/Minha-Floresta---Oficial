import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useApp } from '../contexts/AppContext';
import logoImage from 'figma:asset/f9a96b4548f250beba1ee29ba9d3267b1c5a7b61.png';

export function Footer() {
  const { setCurrentPage } = useApp();
  return (
    <footer className="relative py-16 px-6">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 to-gray-800/95"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <GlassCard className="p-8 md:p-12" variant="dark-glass" intensity="medium">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-24 h-24 flex items-center justify-center">
                  <img
                    src={logoImage}
                    alt="Minha Floresta"
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white text-lg leading-tight">Minha Floresta</span>
                  <span className="text-sm text-green-300 leading-tight">CONSERVAÇÕES</span>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                Conectamos pessoas e empresas com projetos de reflorestamento verificados,
                democratizando o acesso à compensação de carbono e contribuindo para um futuro mais sustentável.
              </p>

              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#como-funciona" onClick={(e) => { e.preventDefault(); setCurrentPage('como-funciona'); }} className="text-gray-300 hover:text-green-400 transition-colors">Como Funciona</a>
                </li>
                <li>
                  <a href="#sobre-projeto" onClick={(e) => { e.preventDefault(); setCurrentPage('sobre-projeto'); }} className="text-gray-300 hover:text-green-400 transition-colors">Sobre o Projeto</a>
                </li>
                <li>
                  <a href="#projetos-sociais" onClick={(e) => { e.preventDefault(); setCurrentPage('projetos-sociais'); }} className="text-gray-300 hover:text-green-400 transition-colors">Projetos Sociais</a>
                </li>
                <li>
                  <a href="#incentivo-fiscal" onClick={(e) => { e.preventDefault(); setCurrentPage('incentivo-fiscal'); }} className="text-gray-300 hover:text-green-400 transition-colors">Incentivo Fiscal</a>
                </li>
                <li>
                  <a href="#calculadora" onClick={(e) => { e.preventDefault(); setCurrentPage('calculadora-pegada'); }} className="text-gray-300 hover:text-green-400 transition-colors">Calculadora</a>
                </li>
                <li className="pt-2">
                  <a href="#dashboard" onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }} className="text-gray-300 hover:text-green-400 transition-colors">Dashboard</a>
                </li>
                <li>
                  <a href="#cms" onClick={(e) => { e.preventDefault(); setCurrentPage('cms'); }} className="text-gray-300 hover:text-green-400 transition-colors">Admin (CMS)</a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white mb-4">Contato</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 break-all">contato@minhaflorestaconservacoes.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">(11) 99999-9999</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-green-400 mt-1" />
                  <span className="text-gray-300">São Paulo, Brasil</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Minha Floresta Conservações. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Política de Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Termos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Cookies</a>
              <a
                href="#dashboard"
                onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}
                className="text-gray-400 hover:text-green-400 text-sm transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#cms"
                onClick={(e) => { e.preventDefault(); setCurrentPage('cms'); }}
                className="text-gray-400 hover:text-green-400 text-sm transition-colors"
              >
                Admin
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}