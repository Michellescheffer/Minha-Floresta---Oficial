import { useCallback, useRef } from 'react';

interface UseDebounceClickOptions {
  delay?: number;
  immediate?: boolean;
}

/**
 * Hook para prevenir cliques duplos em botões
 * Útil para evitar múltiplas submissões ou ações duplicadas
 */
export function useDebounceClick<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceClickOptions = {}
): T {
  const { delay = 300, immediate = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Se já está executando e não é imediato, ignore
      if (isExecutingRef.current && !immediate) {
        return;
      }

      // Limpa timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const execute = () => {
        isExecutingRef.current = true;
        try {
          const result = callback(...args);
          
          // Se é uma Promise, aguarda ela antes de liberar
          if (result && typeof result.then === 'function') {
            result.finally(() => {
              isExecutingRef.current = false;
            });
          } else {
            // Para funções síncronas, libera após o delay
            setTimeout(() => {
              isExecutingRef.current = false;
            }, delay);
          }
          
          return result;
        } catch (error) {
          isExecutingRef.current = false;
          throw error;
        }
      };

      if (immediate) {
        execute();
      } else {
        timeoutRef.current = setTimeout(execute, delay);
      }
    },
    [callback, delay, immediate]
  );

  return debouncedCallback as T;
}

/**
 * Hook específico para botões de ação que devem executar imediatamente
 * mas prevenir cliques duplos por um período
 */
export function useButtonClick<T extends (...args: any[]) => any>(
  callback: T,
  cooldown: number = 500
): T {
  return useDebounceClick(callback, { delay: cooldown, immediate: true });
}