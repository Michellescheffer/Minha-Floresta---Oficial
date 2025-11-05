// Global error handler for the application

// Suppress fetch errors that are expected when backend is not running
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Check if this is a fetch error we want to suppress
  const message = args[0]?.toString() || '';
  
  if (
    message.includes('Failed to fetch') ||
    message.includes('API request failed') ||
    message.includes('fetch') && message.includes('TypeError')
  ) {
    // These are expected when backend is not running - don't log as errors
    return;
  }
  
  // Log all other errors normally
  originalConsoleError.apply(console, args);
};

// Handle unhandled promise rejections (like fetch errors)
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // Suppress fetch-related promise rejections
  if (
    error instanceof TypeError &&
    (error.message.includes('Failed to fetch') || error.message.includes('fetch'))
  ) {
    event.preventDefault(); // Prevent the error from being logged
    return;
  }
  
  // Let other errors bubble up
});

// Global fetch wrapper that suppresses network errors
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    return await originalFetch(input, init);
  } catch (error) {
    // For localhost API calls that fail, this is expected
    if (
      typeof input === 'string' && 
      input.includes('localhost:3001')
    ) {
      // Return a mock failed response instead of throwing
      return new Response(null, { 
        status: 503, 
        statusText: 'Backend not available' 
      });
    }
    
    // Re-throw for other fetch calls
    throw error;
  }
};

export function initializeErrorHandler() {
  console.log('🛡️  Error handler initialized - network errors will be handled gracefully');
}