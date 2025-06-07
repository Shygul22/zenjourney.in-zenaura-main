import React from 'react';
import { Sparkles, Target, Clock } from 'lucide-react';

export const Header = () => {
  return (
    <header className="text-center space-y-6 animate-fade-in">
      {/* Logo and Brand */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient leading-tight">
            ZenJourney
          </h1>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mt-1">
            <span className="px-2 py-1 bg-white/60 rounded-full backdrop-blur-sm border border-white/20 font-medium">
              v2.1.30
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="hidden sm:inline">Production Ready</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="space-y-3">
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
          Intelligent Productivity & Time Management
        </p>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          Transform your daily chaos into focused productivity with AI-powered task prioritization and smart time blocking
        </p>
      </div>

      {/* Feature highlights */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6">
        <div className="flex items-center space-x-2 px-3 py-2 bg-white/70 rounded-full backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transition-all duration-200">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Smart Prioritization</span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-white/70 rounded-full backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transition-all duration-200">
          <Clock className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Time Blocking</span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-white/70 rounded-full backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transition-all duration-200">
          <Sparkles className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Focus Mode</span>
        </div>
      </div>

      {/* Accessibility announcement */}
      <div className="sr-only" aria-live="polite">
        ZenJourney productivity application loaded. Navigate using tab key or screen reader commands.
      </div>
    </header>
  );
};