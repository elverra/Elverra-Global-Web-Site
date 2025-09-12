import React from 'react';
import ServerError from '../../pages/ServerError';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for now; plug into monitoring later
    console.error('Unexpected runtime error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ServerError onRetry={this.handleReset} />;
    }
    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
