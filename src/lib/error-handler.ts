/**
 * Sistema de tratamento de erros global
 * Suprime erros de desenvolvimento do Next.js/Turbopack que não afetam a funcionalidade
 */

// Lista de erros conhecidos do ambiente de desenvolvimento que podem ser ignorados
const IGNORABLE_DEV_ERRORS = [
  'Failed to load chunk',
  'hmr-client',
  '__nextjs_original-stack-frames',
  'turbopack',
  '[turbopack]',
  'Load failed',
];

/**
 * Verifica se um erro é relacionado ao ambiente de desenvolvimento
 */
export function isDevEnvironmentError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return IGNORABLE_DEV_ERRORS.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Handler global de erros não capturados
 */
export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // Captura erros não tratados
  window.addEventListener('error', (event) => {
    if (isDevEnvironmentError(event.error || event.message)) {
      event.preventDefault();
      console.debug('[Dev] Erro de desenvolvimento ignorado:', event.message);
      return;
    }
  });

  // Captura promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    if (isDevEnvironmentError(event.reason)) {
      event.preventDefault();
      console.debug('[Dev] Promise rejection de desenvolvimento ignorada:', event.reason);
      return;
    }
  });
}

/**
 * Wrapper para funções assíncronas com tratamento de erro
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (!isDevEnvironmentError(error as Error)) {
      console.error('Erro capturado:', error);
    }
    return fallback;
  }
}
