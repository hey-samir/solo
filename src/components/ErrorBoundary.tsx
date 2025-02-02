import React, { Component, ErrorInfo, ReactNode } from 'react'
import Error from './Error'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Error
          message={this.state.error?.message || 'Something went wrong'}
          type="page"
          retry={() => {
            this.setState({ hasError: false, error: null })
          }}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary