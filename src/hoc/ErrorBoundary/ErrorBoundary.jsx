import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

    const isProd = import.meta.env.VITE_APP_MODE === 'production';

    if (!isProd) {
      console.error('Uncaught Error: ', error, errorInfo);
    } else {
      // 
    }
  }

  render() {
    if (this.state.hasError) {
      const isProd = import.meta.env.VITE_APP_MODE === 'production';

      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', height: '100vh' }}>
          <p>Something went wrong...</p>

          {!isProd && (
            <details style={{ textAlign: 'center', whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ccc' }}>
              <summary>View error details</summary>
              <p>{this.state.error?.toString()}</p>
              <p>{this.state.errorInfo?.componentStack}</p>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
