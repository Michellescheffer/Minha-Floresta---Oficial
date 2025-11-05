/**
 * ❌ Checkout Cancel Page
 * Página exibida quando pagamento é cancelado
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Icon & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-xl animate-in fade-in zoom-in duration-500">
            <XCircle className="w-12 h-12" />
          </div>
          
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl text-gray-900">
              Pagamento Cancelado
            </h1>
            <p className="text-xl text-gray-600">
              Você cancelou o processo de pagamento
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="space-y-4 text-center">
            <p className="text-gray-700 leading-relaxed">
              Não se preocupe! Nenhuma cobrança foi realizada e seus itens ainda estão no carrinho.
            </p>
            
            <div className="pt-4 space-y-3">
              <div className="flex items-start gap-3 text-left">
                <ShoppingCart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Seus itens estão salvos</p>
                  <p className="text-sm text-gray-600">
                    Você pode continuar a compra a qualquer momento
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-left">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Precisa de ajuda?</p>
                  <p className="text-sm text-gray-600">
                    Nossa equipe está pronta para te auxiliar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/loja')}
            className="gap-2 h-14"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar à Loja
          </Button>
          
          <Button
            size="lg"
            onClick={() => navigate('/carrinho')}
            className="gap-2 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <ShoppingCart className="w-5 h-5" />
            Ir para o Carrinho
          </Button>
        </div>

        {/* FAQ */}
        <Card className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <h3 className="text-lg text-gray-900 mb-4">Possíveis motivos para cancelamento:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Desistência durante o preenchimento dos dados do cartão</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Fechamento acidental da janela de pagamento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Preferência por outro método de pagamento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Necessidade de revisar os itens do carrinho</span>
            </li>
          </ul>
        </Card>

        {/* Contact */}
        <div className="text-center space-y-2 animate-in fade-in duration-700 delay-500">
          <p className="text-gray-600">Ainda com dúvidas?</p>
          <Button
            variant="link"
            onClick={() => navigate('/contato')}
            className="text-green-600 hover:text-green-700"
          >
            Entre em contato conosco →
          </Button>
        </div>
      </div>
    </div>
  );
}
