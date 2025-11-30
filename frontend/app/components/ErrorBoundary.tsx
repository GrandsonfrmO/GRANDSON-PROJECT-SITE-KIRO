'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="text-8xl mb-6 animate-bounce">😵</div>
            <h2 className="text-3xl font-black text-neutral-900 mb-4">
              Oups ! Une erreur s'est produite
            </h2>
            <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
              Quelque chose ne s'est pas passé comme prévu. Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Rafraîchir la page</span>
              </button>
              
              <div>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="text-neutral-600 hover:text-accent transition-colors duration-300 font-semibold"
                >
                  Réessayer
                </button>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-red-50 border border-red-200 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-red-700 mb-2">
                  Détails de l'erreur (développement)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}