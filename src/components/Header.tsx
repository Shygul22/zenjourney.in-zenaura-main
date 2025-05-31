
import React from 'react';

export const Header = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
        ZenJourney
      </h1>
      <p className="text-xl text-gray-600 mb-2">
        Intelligent Productivity & Time Management
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <span className="px-2 py-1 bg-white/60 rounded-full backdrop-blur-sm">
          v2.1.30
        </span>
        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
        <span>Your path to focused productivity</span>
      </div>
    </div>
  );
};
