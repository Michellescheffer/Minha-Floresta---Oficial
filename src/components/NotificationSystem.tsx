import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X, Heart, TreePine, Coins, Shield } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'donation' | 'project' | 'certificate';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove if not persistent
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-6 right-4 z-[9999] max-w-sm w-full space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationCard({ 
  notification, 
  onRemove 
}: { 
  notification: Notification;
  onRemove: () => void;
}) {
  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50/95 border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          iconBg: 'bg-green-100',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50/95 border-red-200',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          iconBg: 'bg-red-100',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50/95 border-yellow-200',
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'donation':
        return {
          bg: 'bg-pink-50/95 border-pink-200',
          icon: <Heart className="w-5 h-5 text-pink-600" />,
          iconBg: 'bg-pink-100',
          titleColor: 'text-pink-800',
          messageColor: 'text-pink-700'
        };
      case 'project':
        return {
          bg: 'bg-green-50/95 border-green-200',
          icon: <TreePine className="w-5 h-5 text-green-600" />,
          iconBg: 'bg-green-100',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'certificate':
        return {
          bg: 'bg-blue-50/95 border-blue-200',
          icon: <Shield className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          bg: 'bg-blue-50/95 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        exit: { duration: 0.2 }
      }}
      className={`${styles.bg} border backdrop-blur-xl rounded-2xl shadow-xl p-4 relative overflow-hidden`}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent" />
      
      <div className="relative flex items-start space-x-3">
        {/* Icon */}
        <div className={`${styles.iconBg} p-2 rounded-xl shrink-0`}>
          {notification.icon || styles.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${styles.titleColor} leading-tight`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`text-sm ${styles.messageColor} mt-1 leading-relaxed`}>
              {notification.message}
            </p>
          )}
          
          {/* Action button */}
          {notification.action && (
            <motion.button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {notification.action.label}
            </motion.button>
          )}
        </div>
        
        {/* Close button */}
        <motion.button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      
      {/* Progress bar for timed notifications */}
      {!notification.persistent && notification.duration && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: notification.duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

// Helper hooks for specific notification types
export function useSuccessNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, action?: Notification['action']) => {
    addNotification({
      type: 'success',
      title,
      message,
      action,
      duration: 4000
    });
  }, [addNotification]);
}

export function useErrorNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, action?: Notification['action']) => {
    addNotification({
      type: 'error',
      title,
      message,
      action,
      duration: 6000
    });
  }, [addNotification]);
}

export function useDonationNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, amount?: number) => {
    addNotification({
      type: 'donation',
      title,
      message,
      icon: <div className="flex items-center space-x-1">
        <Heart className="w-4 h-4 text-pink-600" />
        {amount && <span className="text-xs font-medium text-pink-600">R$ {amount}</span>}
      </div>,
      duration: 5000
    });
  }, [addNotification]);
}

export function useProjectNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, projectName?: string) => {
    addNotification({
      type: 'project',
      title,
      message,
      icon: <div className="flex items-center space-x-1">
        <TreePine className="w-4 h-4 text-green-600" />
        {projectName && <span className="text-xs text-green-600 truncate max-w-20">{projectName}</span>}
      </div>,
      duration: 4000
    });
  }, [addNotification]);
}

export function useCertificateNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, certificateCode?: string) => {
    addNotification({
      type: 'certificate',
      title,
      message,
      icon: <div className="flex items-center space-x-1">
        <Shield className="w-4 h-4 text-blue-600" />
        {certificateCode && <span className="text-xs text-blue-600 font-mono">{certificateCode}</span>}
      </div>,
      duration: 6000,
      action: certificateCode ? {
        label: 'Ver Certificado',
        onClick: () => {
          // Navigate to certificate verification
          window.open(`#verificar-certificado?code=${certificateCode}`, '_blank');
        }
      } : undefined
    });
  }, [addNotification]);
}

// Quick notification functions
export const showSuccessNotification = (title: string, message?: string) => {
  // This would need to be used within the notification context
  console.log('Success:', title, message);
};

export const showErrorNotification = (title: string, message?: string) => {
  console.log('Error:', title, message);
};

export const showDonationNotification = (title: string, message?: string, amount?: number) => {
  console.log('Donation:', title, message, amount);
};