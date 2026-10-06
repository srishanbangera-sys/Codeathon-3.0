import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ERROR_BOUNDARY_CAUGHT:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto mt-12 bg-white rounded-3xl border border-red-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#051c24] mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">We couldn't load this section.</p>
          <pre className="text-left text-xs bg-gray-50 p-4 rounded-xl overflow-auto text-red-600 mb-6">
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()} className="bg-[#2dc1c1] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#1b8c8c] transition-colors">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
