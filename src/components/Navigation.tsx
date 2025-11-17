import { Menu, X, ShoppingCart, QrCode, User, LogOut, Settings, Heart, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { useApp, PageType } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import logoImage from 'figma:asset/f9a96b4548f250beba1ee29ba9d3267b1c5a7b61.png';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentPage, setCurrentPage, totalItems } = useApp();
  const { user, isAuthenticated, logout } = useAuth();

  // Detect scroll position to adjust menu colors
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const windowHeight = window.innerHeight;
          
          // Consider "scrolled" when we're past the first section (hero)
          setIsScrolled(scrollPosition > windowHeight * 0.7);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const navItems: { name: string; page: PageType; href: string }[] = [
    { name: 'Início', page: 'home', href: '#home' },
    { name: 'Como Funciona', page: 'como-funciona', href: '#como-funciona' },
    { name: 'Sobre o Projeto', page: 'sobre-projeto', href: '#sobre-projeto' },
    { name: 'Blue Carbon', page: 'blue-carbon', href: '#blue-carbon' },
    { name: 'Loja', page: 'loja', href: '#loja' },
    { name: 'Projetos Sociais', page: 'projetos-sociais', href: '#projetos-sociais' },
    { name: 'Calculadora', page: 'calculadora-pegada', href: '#calculadora' },
    { name: 'Contato', page: 'contato', href: '#contato' }
  ];

  const handleNavClick = (page: PageType) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  // Dynamic styles based on scroll position and current page
  const isDarkBackground = currentPage === 'home' && !isScrolled;
  
  const textColorClass = isDarkBackground 
    ? 'text-white drop-shadow-md' 
    : 'text-[#1a200e]';
    
  const activeTextColorClass = isDarkBackground 
    ? 'text-green-300 font-semibold' 
    : 'text-green-600 font-semibold';
    
  const hoverTextColorClass = isDarkBackground 
    ? 'hover:text-green-200' 
    : 'hover:text-green-600';
    
  const iconColorClass = isDarkBackground 
    ? 'text-white/90 hover:text-green-200 drop-shadow-sm' 
    : 'text-[#1a200e] hover:text-green-600';

  // Logo filter for color change (white to black based on scroll)
  const logoFilterClass = isDarkBackground 
    ? 'brightness-0 invert drop-shadow-md' // Makes logo white
    : 'brightness-0 drop-shadow-sm'; // Makes logo black

  return (
    <nav className="fixed top-6 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4 sm:px-6 safe-area-top">
      <GlassCard className={`px-4 sm:px-6 py-3 sm:py-2 transition-all duration-500 ease-out ${
        isDarkBackground 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30 backdrop-blur-xl'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            className="flex items-center cursor-pointer"
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
          >
            <div className="w-40 h-40 sm:w-52 sm:h-52 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="Minha Floresta" 
                className={`w-full h-full object-contain transition-all duration-500 ease-out ${logoFilterClass}`}
              />
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navItems.slice(0, 6).map((item) => (
              <a
                key={item.page}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(item.page); }}
                className={`transition-all duration-300 font-medium text-sm xl:text-base px-2 py-1 rounded-lg hover:bg-white/10 ${
                  currentPage === item.page 
                    ? `${activeTextColorClass} bg-white/15`
                    : `${textColorClass} ${hoverTextColorClass}`
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <a
              href="#verificar-certificado"
              onClick={(e) => { e.preventDefault(); handleNavClick('verificar-certificado'); }}
              className={`flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 transition-all duration-300 ${iconColorClass}`}
              title="Verificar Certificado"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm hidden lg:inline">Verificar</span>
            </a>
            
            <a
              href="#carrinho"
              onClick={(e) => { e.preventDefault(); handleNavClick('carrinho'); }}
              className={`relative p-1.5 sm:p-2 transition-all duration-300 ${iconColorClass}`}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </a>

            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-2 p-2 transition-all duration-300 ${iconColorClass}`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs sm:text-sm hidden lg:inline max-w-20 truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl overflow-hidden animate-scale-up">
                    <div className="p-3 border-b border-white/20">
                      <p className="text-gray-800 font-medium truncate">{user?.name}</p>
                      <p className="text-gray-600 text-xs truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <a
                        href="#dashboard"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick('dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-white/50 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Dashboard
                      </a>
                      <a
                        href="#cms"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick('cms');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Admin (CMS)
                      </a>
                      <a
                        href="#cleanup-test"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick('cleanup-test');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        🧹 Limpar DB
                      </a>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-white/50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center space-x-2 p-1.5 sm:p-2 transition-all duration-300 ${iconColorClass}`}
              >
                <User className="w-5 h-5" />
                <span className="text-xs sm:text-sm hidden lg:inline">Entrar</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 transition-all duration-300 ${iconColorClass}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.page}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.page); }}
                  className={`text-left transition-all duration-300 ${
                    currentPage === item.page 
                      ? activeTextColorClass
                      : `${textColorClass} ${hoverTextColorClass}`
                  }`}
                >
                  {item.name}
                </a>
              ))}
              
              <a
                href="#verificar-certificado"
                onClick={(e) => { e.preventDefault(); handleNavClick('verificar-certificado'); }}
                className={`text-left flex items-center space-x-2 transition-all duration-300 ${iconColorClass}`}
              >
                <QrCode className="w-4 h-4" />
                <span>Verificar Certificado</span>
              </a>
              

              
              {/* Mobile User Section */}
              {isAuthenticated ? (
                <>
                  <a
                    href="#dashboard"
                    onClick={(e) => { e.preventDefault(); handleNavClick('dashboard'); }}
                    className={`text-left flex items-center space-x-2 transition-all duration-300 ${iconColorClass}`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Dashboard</span>
                  </a>
                  <a
                    href="#cms"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('cms');
                      setIsMenuOpen(false);
                    }}
                    className={`text-left flex items-center space-x-2 transition-all duration-300 text-blue-600`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin (CMS)</span>
                  </a>
                  <a
                    href="#cleanup-test"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('cleanup-test');
                      setIsMenuOpen(false);
                    }}
                    className={`text-left flex items-center space-x-2 transition-all duration-300 text-red-600`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>🧹 Limpeza DB (TESTE)</span>
                  </a>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className={`text-left flex items-center space-x-2 transition-all duration-300 ${iconColorClass}`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair ({user?.name?.split(' ')[0]})</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left flex items-center space-x-2 transition-all duration-300 ${iconColorClass}`}
                >
                  <User className="w-4 h-4" />
                  <span>Entrar / Cadastrar</span>
                </button>
              )}
              
              <div className="flex items-center pt-4">
                <a
                  href="#carrinho"
                  onClick={(e) => { e.preventDefault(); handleNavClick('carrinho'); }}
                  className={`relative p-2 transition-all duration-300 ${iconColorClass}`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </a>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
}