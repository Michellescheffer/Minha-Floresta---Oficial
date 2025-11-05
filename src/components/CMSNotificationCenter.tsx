import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, X, CheckCircle, AlertTriangle, Info, DollarSign, Users, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'transaction';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

export function CMSNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'transaction',
      title: 'Nova Transação',
      message: 'Pedro Silva comprou 150m² no projeto Amazônia Verde',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      action: {
        label: 'Ver Detalhes',
        handler: () => console.log('View transaction')
      }
    },
    {
      id: '2',
      type: 'success',
      title: 'Certificado Emitido',
      message: 'Certificado MFC-2024-0156 emitido para Ana Costa',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Estoque Baixo',
      message: 'Projeto Mata Atlântica com menos de 500m² disponíveis',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'info',
      title: 'Nova Doação',
      message: 'Doação de R$ 250 recebida para Educação Ambiental',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    },
    {
      id: '5',
      type: 'transaction',
      title: 'Pagamento Aprovado',
      message: 'Pagamento de R$ 1.200 aprovado - Maria Santos',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: true
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);

  // Simular notificações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvents = [
        {
          type: 'transaction' as const,
          title: 'Nova Transação',
          message: `${['João Silva', 'Maria Costa', 'Pedro Santos', 'Ana Oliveira'][Math.floor(Math.random() * 4)]} comprou ${Math.floor(Math.random() * 200) + 50}m²`
        },
        {
          type: 'success' as const,
          title: 'Certificado Emitido',
          message: `Certificado MFC-2024-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')} emitido`
        },
        {
          type: 'info' as const,
          title: 'Nova Doação',
          message: `Doação de R$ ${Math.floor(Math.random() * 500) + 50} recebida`
        }
      ];

      if (Math.random() > 0.7) { // 30% chance
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: event.type,
          title: event.title,
          message: event.message,
          timestamp: new Date(),
          read: false
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'transaction':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="relative bg-white/10 backdrop-blur-md border-white/20"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </DialogTitle>
              <DialogDescription>
                {unreadCount > 0 ? `${unreadCount} notificação(ões) não lida(s)` : 'Todas as notificações lidas'}
              </DialogDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`bg-white/5 border-white/10 transition-all duration-200 ${
                  !notification.read ? 'bg-white/10 border-blue-200' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-7"
                          >
                            Marcar como lida
                          </Button>
                        )}
                        {notification.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={notification.action.handler}
                            className="text-xs h-7"
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}