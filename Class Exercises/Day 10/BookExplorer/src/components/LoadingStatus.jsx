import React from 'react';

// Render Props Component for handling loading status and user greeting
const LoadingStatus = ({ 
  isLoading, 
  children, 
  userName = 'Reader'
}) => {
  return (
    <div className="loading-status-container">
      {isLoading && (
        <div className="greeting-message">
          <p>Welcome back, {userName}!</p>
        </div>
      )}
      {children({ isLoading, userName })}
    </div>
  );
};

export default LoadingStatus;
