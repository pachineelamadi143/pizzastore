import React from 'react';

// Higher Order Component (HOC) for loading spinner functionality
const withLoading = (Component) => {
  return function WithLoadingComponent({
    isLoading,
    ...props
  }) {
    if (isLoading) {
      return (
        <div className="loading-spinner-container">
          <div className="spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-text">Loading...</div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default withLoading;
