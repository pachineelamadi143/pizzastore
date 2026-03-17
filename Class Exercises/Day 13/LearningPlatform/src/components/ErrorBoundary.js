import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error){
    return { hasError: true, error };
  }

  componentDidCatch(error, info){
    console.error('ErrorBoundary caught:', error, info);
  }

  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:12,border:'1px solid #ffb3b3',background:'#fff1f1'}}>
          <h3>Something went wrong.</h3>
          <p>We're showing a fallback UI instead of crashing the app.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
