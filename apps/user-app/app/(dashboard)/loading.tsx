import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="loadingContainer">
      <div className="spinner"></div>
      <p className='text-xl font-semibold'>Fetching Data...</p>
    </div>
  );
};

export default Loading;
