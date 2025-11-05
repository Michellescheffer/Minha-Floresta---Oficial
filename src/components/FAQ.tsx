import { Plus, Minus, HelpCircle, Shield, Leaf, CreditCard, FileText, Globe } from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from './GlassCard';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqCategories = [
    {
      title: "Funcionamento",
      icon: <HelpCircle className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      faqs: [
        {
          question: "Como funciona a compra de metros quadrados de floresta?",
          answer: "Você escolhe a quantidade de metros quadrados que deseja compensar, seleciona um projeto verificado e realiza o pagamento. Cada m² representa uma área real de floresta preservada ou reflorestada, com certificação internacional."
        },
        {
          question: "Como é calculado o quanto preciso comprar para compensar minha pegada?",
          answer: "Nossa calculadora analisa seus hábitos de consumo, transporte, energia e estilo de vida para estimar suas emissões anuais de CO₂. Com base nisso, sugerimos a quantidade ideal de metros quadrados para neutralizar seu impacto."
        },
        {
          question: "Posso escolher em qual projeto investir?",
          answer: "Sim! Oferecemos diversos projetos em diferentes biomas (Amazônia, Mata Atlântica, Cerrado) com características específicas. Você pode escolher baseado na localização, tipo de atividade ou impacto social."
        }
      ]
    },
    {
      title: "Certificação",
      icon: <Shield className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      faqs: [
        {
          question: "Que tipos de certificação vocês oferecem?",
          answer: "Oferecemos certificados físicos e digitais. O físico é enviado pelos Correios em papel certificado com marca d'água e QR Code. O digital fica disponível imediatamente na plataforma com verificação blockchain."
        },
        {
          question: "Como verifico a autenticidade do meu certificado?",
          answer: "Todo certificado possui um código único que pode ser verificado na nossa página de verificação. Você também pode usar o QR Code presente no certificado físico para acessar todas as informações do projeto."
        },
        {
          question: "Os projetos são realmente verificados por terceiros?",
          answer: "Sim! Todos os nossos projetos possuem certificação VCS, Gold Standard, REDD+ ou FSC. São auditados por empresas independentes e seguem padrões internacionais de MRV (Medição, Relato e Verificação)."
        }
      ]
    },
    {
      title: "Impacto Ambiental",
      icon: <Leaf className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-500",
      faqs: [
        {
          question: "Quanto CO₂ é compensado por metro quadrado?",
          answer: "Varia conforme o projeto e bioma, mas em média: Amazônia (15-20 ton CO₂/m²), Mata Atlântica (8-12 ton CO₂/m²), Cerrado (6-10 ton CO₂/m²). Esses valores são calculados ao longo de 30 anos de crescimento da floresta."
        },
        {
          question: "Posso acompanhar o desenvolvimento do meu projeto?",
          answer: "Sim! Nossa plataforma oferece monitoramento em tempo real via satélite, relatórios trimestrais de crescimento, fotos aéreas e atualizações sobre as comunidades beneficiadas. Você recebe notificações de todos os marcos importantes."
        },
        {
          question: "O que acontece se árvores morrerem ou houver incêndios?",
          answer: "Nossos projetos incluem seguro e plano de contingência. Mantemos áreas de reserva (20% extras) e temos acordos de replantio. Além disso, trabalhamos com prevenção através de sistemas de monitoramento 24/7 e brigadas locais."
        }
      ]
    },
    {
      title: "Pagamento e Preços",
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-yellow-500 to-orange-500",
      faqs: [
        {
          question: "Quais formas de pagamento vocês aceitam?",
          answer: "Aceitamos cartões de crédito/débito (via Stripe), PIX, transferência bancária e principais criptomoedas (Bitcoin, Ethereum, USDC). Para empresas, oferecemos boleto bancário e faturamento com prazo."
        },
        {
          question: "Por que os preços variam entre projetos?",
          answer: "O preço reflete o custo real de cada projeto: tipo de intervenção (preservação vs. reflorestamento), localização, benefícios sociais inclusos, nível de certificação e capacidade de captura de CO₂ por m²."
        },
        {
          question: "Existe desconto para grandes volumes?",
          answer: "Sim! Oferecemos desconto progressivo: 5% para mais de 1.000m², 10% para mais de 5.000m² e desconto personalizado para empresas com mais de 10.000m². Também temos planos de assinatura mensal com desconto."
        }
      ]
    },
    {
      title: "Benefícios Fiscais",
      icon: <FileText className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      faqs: [
        {
          question: "Posso deduzir a compra no Imposto de Renda?",
          answer: "Sim! Pessoas físicas podem deduzir até 6% da renda bruta anual, e pessoas jurídicas até 2% do lucro operacional. Emitimos automaticamente todos os documentos necessários para a Receita Federal."
        },
        {
          question: "Como funciona a dedução para empresas?",
          answer: "Empresas podem deduzir como investimento em sustentabilidade ou doação para projetos socioambientais. Também oferece benefícios para relatórios ESG e pode gerar créditos de carbono comercializáveis dependendo do volume."
        },
        {
          question: "Quais documentos recebo para o IR?",
          answer: "Você recebe: recibo de doação com CNPJ da entidade executora, certificado de participação no projeto, relatório detalhado de impacto e todos os comprovantes necessários organizados por ano fiscal."
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex: number, faqIndex: number) => {
    const globalIndex = categoryIndex * 100 + faqIndex;
    setOpenIndex(openIndex === globalIndex ? null : globalIndex);
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-green-50/80 to-blue-50/80"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-medium">Perguntas Frequentes</span>
          </div>
          
          <h2 className="text-gray-800 mb-6">
            Tire suas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Dúvidas
            </span>
          </h2>
          
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
            Encontre respostas para as principais dúvidas sobre nossos projetos, certificações e como funciona a compensação de carbono.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <GlassCard key={categoryIndex} className="overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${category.color} p-6`}>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
              </div>

              {/* FAQs */}
              <div className="divide-y divide-gray-200/30">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div key={faqIndex}>
                      <button
                        onClick={() => toggleFAQ(categoryIndex, faqIndex)}
                        className="w-full px-6 py-6 text-left hover:bg-gray-50/30 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-gray-800 font-medium pr-4 leading-relaxed">
                            {faq.question}
                          </h4>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <Minus className="w-5 h-5 text-gray-500" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <div className="bg-gray-50/50 p-4 rounded-lg border-l-4 border-green-400">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16">
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Não encontrou sua resposta?
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nossa equipe de especialistas está pronta para esclarecer qualquer dúvida sobre 
              compensação de carbono, projetos específicos ou certificações.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300">
                Falar com Especialista
              </button>
              <button className="border-2 border-blue-500/30 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-500/10 transition-all duration-300">
                Enviar E-mail
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}