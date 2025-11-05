import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Building, Users } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useState } from 'react';

export function ContatoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      type: 'general'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      details: ['contato@minhaflorestaconservacoes.com.br', 'parcerias@minhaflorestaconservacoes.com.br'],
      color: 'text-blue-600'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Telefone',
      details: ['(11) 3456-7890', '(11) 99999-9999 (WhatsApp)'],
      color: 'text-green-600'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Endereço',
      details: ['Rua das Palmeiras, 1000', 'São Paulo, SP - CEP 01234-567'],
      color: 'text-purple-600'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Horário de Atendimento',
      details: ['Segunda a Sexta: 8h às 18h', 'Sábado: 8h às 12h'],
      color: 'text-orange-600'
    }
  ];

  const departments = [
    { value: 'general', label: 'Informações Gerais', icon: <MessageCircle className="w-5 h-5" /> },
    { value: 'sales', label: 'Vendas e Projetos', icon: <Building className="w-5 h-5" /> },
    { value: 'partnership', label: 'Parcerias', icon: <Users className="w-5 h-5" /> },
    { value: 'support', label: 'Suporte Técnico', icon: <Phone className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen pt-52 sm:pt-48 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-blue-50/80 to-green-50/80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Entre em Contato
            </span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Nossa equipe especializada está pronta para atendê-lo com soluções personalizadas em conservação 
            ambiental e projetos de reflorestamento. Entre em contato conosco através dos canais abaixo ou 
            preencha o formulário e responderemos o mais breve possível. Estamos comprometidos em oferecer 
            o melhor suporte para suas necessidades de compensação de carbono e sustentabilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-gray-800 mb-6">Informações de Contato</h2>
            
            {contactInfo.map((item, index) => (
              <GlassCard key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 bg-gradient-to-r from-gray-100 to-white rounded-2xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">{item.title}</h3>
                    {item.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm leading-relaxed">{detail}</p>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}

            {/* Quick Contact */}
            <GlassCard className="p-6 bg-gradient-to-r from-green-50/50 to-blue-50/50">
              <h3 className="font-medium text-gray-800 mb-4">Contato Rápido</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Para emergências ou dúvidas urgentes sobre projetos em andamento, 
                utilize nosso WhatsApp para atendimento imediato.
              </p>
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chat no WhatsApp</span>
              </button>
            </GlassCard>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8">
              <h2 className="text-gray-800 mb-6">Envie sua Mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Departamento *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Assunto *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Mensagem *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                    placeholder="Detalhe sua solicitação ou dúvida. Quanto mais informações você fornecer, melhor poderemos atendê-lo."
                  />
                </div>

                {/* Department specific information */}
                {formData.type === 'sales' && (
                  <GlassCard className="p-4 bg-blue-50/50">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Dica:</strong> Para consultas sobre projetos, inclua a localização desejada, 
                      quantidade de metros quadrados e prazo esperado.
                    </p>
                  </GlassCard>
                )}

                {formData.type === 'partnership' && (
                  <GlassCard className="p-4 bg-green-50/50">
                    <p className="text-sm text-green-700">
                      🤝 <strong>Parcerias:</strong> Descreva o tipo de parceria de interesse e como 
                      sua organização pode contribuir para nossos projetos.
                    </p>
                  </GlassCard>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar Mensagem</span>
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Ao enviar esta mensagem, você concorda com nossos termos de privacidade. 
                  Responderemos em até 24 horas úteis.
                </p>
              </form>
            </GlassCard>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <GlassCard className="p-8">
            <h2 className="text-gray-800 mb-6 text-center">Perguntas Frequentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: 'Qual o prazo de resposta para orçamentos?',
                  a: 'Respondemos todas as solicitações de orçamento em até 24 horas úteis com uma proposta personalizada.'
                },
                {
                  q: 'Como acompanho meu projeto após a compra?',
                  a: 'Você receberá relatórios periódicos e acesso a uma área exclusiva para monitorar o progresso do seu projeto.'
                },
                {
                  q: 'Vocês oferecem visitas técnicas aos projetos?',
                  a: 'Sim! Organizamos visitas técnicas para clientes interessados em conhecer nossos projetos presencialmente.'
                },
                {
                  q: 'Como funciona o processo de certificação?',
                  a: 'Todos os nossos projetos seguem padrões internacionais e você recebe certificados digitais verificáveis.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white/30 p-6 rounded-2xl">
                  <h4 className="font-medium text-gray-800 mb-3">{faq.q}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}