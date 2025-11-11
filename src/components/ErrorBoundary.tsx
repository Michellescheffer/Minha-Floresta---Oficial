import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    try {
      console.error('Runtime error captured:', error, info);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-orange-50/80 to-yellow-50/80"></div>
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <h1 className="text-gray-800 mb-4">Ocorreu um erro</h1>
            <p className="text-gray-600 mb-2">Tente recarregar a página. Se persistir, entre em contato.</p>
            <div className="text-xs text-gray-500 break-words">{String(this.state.error)}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
