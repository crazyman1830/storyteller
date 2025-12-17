import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-fade-in">
      <div className="relative w-16 h-16">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary/20 animate-spin"></div>
        {/* Inner Ring */}
        <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-primary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        {/* Core Glow */}
        <div className="absolute inset-0 m-auto w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
      </div>
      
      <div className="text-center space-y-1">
        <h3 className="text-lg font-medium text-gray-200 tracking-wide">AI가 원고를 집필하고 있습니다</h3>
        <p className="text-sm text-gray-500">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;