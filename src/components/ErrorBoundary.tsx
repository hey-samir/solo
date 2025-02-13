import React, { Component, ErrorInfo, ReactNode } from 'react'
import Error from './Error'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('React Error Boundary Caught Error:');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.groupEnd();
    }

    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Error
          message="Looks like this route's beta isn't working! Our route setters are on it! 🧗‍♂️"
          type="page"
          retry={() => {
            this.setState({ 
              hasError: false, 
              error: null,
              errorInfo: null
            });
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;