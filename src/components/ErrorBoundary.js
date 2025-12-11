import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // Optionally: send error to logging service here
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#c62828' }}>{this.state.error?.toString()}</pre>
          <details style={{ whiteSpace: 'pre-wrap' }}>{this.state.info?.componentStack}</details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
