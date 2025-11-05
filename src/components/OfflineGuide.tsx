import React from 'react';
import { AlertTriangle, Database, Terminal, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function OfflineGuide() {
  return (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50/80">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>Sistema em Modo Offline</strong> - Todas as funcionalidades estão disponíveis usando dados locais.
        </AlertDescription>
      </Alert>

      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-blue-600" />
            Como Conectar ao MySQL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Passos para Ativação Completa:
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <strong>Abrir terminal na pasta do projeto</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                    cd backend
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <strong>Instalar dependências</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                    npm install
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <strong>Configurar banco de dados</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                    npm run init-db
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <strong>Adicionar dados de teste</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                    npm run seed-db
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</span>
                <div>
                  <strong>Iniciar servidor</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                    npm run dev
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">6</span>
                <div>
                  <strong>Recarregar esta página</strong>
                  <p className="text-gray-600 text-xs mt-1">
                    O status mudará para "Online - Conectado ao banco" automaticamente
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50/80">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              <strong>Funcionalidades Offline:</strong> Carrinho, compras, certificados, doações, 
              calculadora e dashboard estão 100% funcionais usando localStorage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}