import { Minus, Plus, Trash2, CreditCard, Download, Leaf, MapPin, Award, ShoppingCart, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/AuthModal';

export function CarrinhoPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, total_m2, clearCart } = useApp();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  // Fluxo hospedado do Stripe: sem seleção de método local
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');

  const { createPaymentIntent, error: stripeError, isLoading } = useStripeCheckout();

  useEffect(() => {
    // Se o usuário logar e o campo estiver vazio, preenche automaticamente
    if (user?.email && !buyerEmail) {
      setBuyerEmail(user.email);
    }
  }, [user?.email]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen page-content">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
          <GlassCard className="p-12 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-gray-800 mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-8">
              Explore nossos projetos verificados e comece a compensar sua pegada de carbono!
            </p>
            <button
              onClick={() => window.location.hash = 'loja'}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Ver Projetos Disponíveis
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 50) {
      toast.error('Quantidade mínima é 50 m²');
      return;
    }
    updateQuantity(itemId, newQuantity);
    toast.success(`Quantidade atualizada para ${newQuantity} m²`);
  };

  const PaymentInfoHosted = () => (
    <div className="mb-6">
      <label className="block text-gray-700 mb-3">Como você pagará</label>
      <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50 text-purple-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5" />
          <div className="text-sm">
            <div className="font-medium">Página segura do Stripe</div>
            <div className="text-purple-700/90">Você será redirecionado para concluir o pagamento com segurança.</div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleRemoveItem = (itemId: string, projectName: string) => {
    removeFromCart(itemId);
    toast.success(`${projectName} removido do carrinho`);
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      clearCart();
      toast.success('Carrinho limpo com sucesso');
    }
  };

  const handleCheckout = () => {
    if (isProcessing || isLoading) return;

    // Checkout hospedado: sempre redireciona para o Stripe

    if (!user) {
      setAuthOpen(true);
      toast.error('Entre ou crie uma conta para continuar.');
      return;
    }

    if (!buyerEmail.trim()) {
      toast.error('Informe seu email para continuar.');
      return;
    }

    const items = cartItems.map((item) => ({
      project_id: item.projectId,
      quantity: item.m2Quantity,
      price: item.price_per_m2,
    }));

    (async () => {
      try {
        setIsProcessing(true);
        setShowCheckout(true);

        const resp = await createPaymentIntent({
          type: 'purchase',
          items,
          user_id: (user as any)?.id || null,
          email: buyerEmail,
          metadata: {
            certificate_type: 'digital',
            use_hosted: true,
            success_url: `${window.location.origin}/#checkout-return?p=purchases&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/#loja`,
          },
        } as any);

        if ((resp as any).session_url) {
          window.location.href = (resp as any).session_url as string;
          return;
        }

        throw new Error(resp.error || 'Erro ao criar sessão de pagamento');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao iniciar pagamento';
        toast.error(msg);
        setShowCheckout(false);
      } finally {
        setIsProcessing(false);
      }
    })();
  };

  const calculateImpact = () => {
    const co2Compensated = total_m2 * 2.5;
    const treesEquivalent = Math.round(total_m2 / 10);
    const carsOffRoad = Math.round(co2Compensated / 2300); // Média anual de emissão de um carro
    
    return { co2Compensated, treesEquivalent, carsOffRoad };
  };

  const impact = calculateImpact();

  return (
    <div className="min-h-screen page-content">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-6">
            <ShoppingCart className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Carrinho</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-6">
            Carrinho de
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Compensação
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revise sua compra de metros quadrados e finalize a compensação
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-6">
              <h3 className="text-gray-800 mb-4">Resumo do Pedido</h3>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-white/30 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.projectName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-gray-800 mb-1">{item.projectName}</h4>
                      <p className="text-gray-600 text-sm">Projeto Verificado</p>
                      <div className="text-green-600 font-medium mt-1">
                        R$ {item.price_per_m2.toFixed(2)}/m²
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.m2Quantity - 50)}
                        disabled={item.m2Quantity <= 50}
                        className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center text-gray-600 hover:bg-white/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <div className="text-center min-w-[80px]">
                        <div className="font-medium">{item.m2Quantity} m²</div>
                        <div className="text-sm text-gray-600">
                          R$ {(item.price_per_m2 * item.m2Quantity).toFixed(2)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.m2Quantity + 50)}
                        className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center text-gray-600 hover:bg-white/70 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.id, item.projectName)}
                      className="text-red-500 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
            
            {/* Clear Cart */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-600 transition-colors text-sm flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar carrinho</span>
              </button>
            </div>
          </div>

          {/* Checkout */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-gray-800 mb-6">Resumo da Compensação</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de m²:</span>
                  <span className="font-medium">{total_m2.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ compensado/ano:</span>
                  <span className="font-medium text-green-600">~{impact.co2Compensated.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Equivale a:</span>
                  <span className="font-medium text-blue-600">{impact.treesEquivalent} árvores</span>
                </div>
                <div className="text-gray-600">
                  <span>Subtotal:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="text-gray-600">
                  <span>Taxas Stripe:</span>
                  <span>Incluídas</span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-gray-800 font-medium text-lg">
                    <span>Total:</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Buyer Email */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Email para confirmação</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {/* Opções de pagamento removidas: uso obrigatório do Checkout hospedado do Stripe */}
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing || isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <CreditCard className="w-5 h-5" />
                <span>{(isProcessing || isLoading) ? 'Redirecionando...' : 'Ir para Página Segura do Stripe'}</span>
              </button>
              
              <div className="mt-4 space-y-2 text-center text-sm text-gray-600">
                <div>🔒 Você será redirecionado para a página segura do Stripe para concluir o pagamento</div>
                <div>📜 Certificado digital disponível imediatamente</div>
                <div>📦 Certificado físico enviado em até 7 dias</div>
              </div>
            </GlassCard>

            {/* Stripe Elements desativado: fluxo obrigatório via Checkout hospedado do Stripe */}

            {(!user) && (
              <div className="text-center text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                Faça login para finalizar sua compra.
              </div>
            )}

            {/* Impact Details */}
            <GlassCard className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-gray-800 mb-4">Seu Impacto Ambiental</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="bg-white/30 rounded-lg p-3">
                    <div className="font-medium text-green-600">
                      {impact.co2Compensated.toLocaleString()} kg CO₂/ano
                    </div>
                    <div className="text-gray-600">Carbono compensado</div>
                  </div>
                  
                  <div className="bg-white/30 rounded-lg p-3">
                    <div className="font-medium text-blue-600">
                      {impact.treesEquivalent} árvores
                    </div>
                    <div className="text-gray-600">Equivalência em plantio</div>
                  </div>
                  
                  {impact.carsOffRoad > 0 && (
                    <div className="bg-white/30 rounded-lg p-3">
                      <div className="font-medium text-purple-600">
                        {impact.carsOffRoad} carro{impact.carsOffRoad > 1 ? 's' : ''}
                      </div>
                      <div className="text-gray-600">Retirado{impact.carsOffRoad > 1 ? 's' : ''} de circulação/ano</div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}