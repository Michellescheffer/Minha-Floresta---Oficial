import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEOHead({
  title = 'Minha Floresta - Compense sua Pegada de Carbono',
  description = 'Compre metros quadrados de projetos de reflorestamento e gere impacto ambiental positivo. Certificados físicos e digitais com sistema MRV.',
  keywords = 'reflorestamento, carbono, sustentabilidade, meio ambiente, compensação, pegada de carbono, certificado, MRV',
  image = 'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
  url = 'https://minhaflorestaconservacoes.com',
  type = 'website'
}: SEOHeadProps) {
  
  useEffect(() => {
    // Atualizar o título da página
    document.title = title;
    
    // Função para atualizar ou criar meta tags
    const updateMetaTag = (property: string, content: string, isProperty: boolean = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Meta tags básicas
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Minha Floresta Conservações');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Minha Floresta Conservações', true);
    updateMetaTag('og:locale', 'pt_BR', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Minha Floresta Conservações",
      "description": description,
      "url": url,
      "logo": image,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "areaServed": "BR",
        "availableLanguage": "Portuguese"
      },
      "sameAs": [
        // Adicionar URLs de redes sociais quando disponível
      ]
    };

    // Adicionar JSON-LD para structured data
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(structuredData);
    
    // Adicionar preload para fontes críticas
    const addPreloadLink = (href: string, as: string, type?: string, crossorigin?: boolean) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) link.type = type;
        if (crossorigin) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    };

    // Preload de recursos críticos
    addPreloadLink('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', 'style');
    
    // DNS prefetch para domínios externos
    const addDnsPrefetch = (href: string) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = href;
        document.head.appendChild(link);
      }
    };

    addDnsPrefetch('//images.unsplash.com');
    addDnsPrefetch('//fonts.googleapis.com');
    addDnsPrefetch('//fonts.gstatic.com');
    
  }, [title, description, keywords, image, url, type]);

  return null; // Este é um componente que não renderiza nada visualmente
}

// Hook para páginas específicas
export function usePageSEO(pageData: SEOHeadProps) {
  useEffect(() => {
    // Criar uma instância temporária do SEOHead para a página específica
    const seoInstance = document.createElement('div');
    // Simular a execução do useEffect do SEOHead
    const event = new CustomEvent('updateSEO', { detail: pageData });
    window.dispatchEvent(event);
  }, [pageData]);
}

// Presets para páginas específicas
export const seoPresets = {
  home: {
    title: 'Minha Floresta - Compense sua Pegada de Carbono',
    description: 'Compre metros quadrados de projetos de reflorestamento e gere impacto ambiental positivo. Certificados físicos e digitais com sistema MRV.'
  },
  loja: {
    title: 'Loja - Minha Floresta Conservações',
    description: 'Explore nossos projetos de reflorestamento disponíveis. Compre metros quadrados e receba certificados físicos e digitais.'
  },
  calculadora: {
    title: 'Calculadora de Pegada de Carbono - Minha Floresta',
    description: 'Calcule sua pegada de carbono e descubra quantos metros quadrados você precisa para compensar suas emissões.'
  },
  comoFunciona: {
    title: 'Como Funciona - Minha Floresta Conservações',
    description: 'Entenda nosso processo de reflorestamento, certificação e como você pode fazer a diferença para o meio ambiente.'
  },
  sobreProjeto: {
    title: 'Sobre o Projeto - Minha Floresta Conservações',
    description: 'Conheça nossa missão de promover a conservação ambiental através de projetos de reflorestamento sustentáveis.'
  }
};