import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">糟糕，出现了一个错误</h1>
          <p className="text-sm text-red-500 bg-white p-4 rounded-xl shadow-sm overflow-auto max-w-full">
            {this.state.error?.message || '未知错误'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-medium shadow-sm hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
