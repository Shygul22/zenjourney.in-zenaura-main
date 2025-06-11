import React from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to React</h1>
          <p className="text-gray-600">Your application is running successfully!</p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-800 mb-2">Getting Started</h2>
            <p className="text-sm text-gray-600">
              Edit <code className="bg-gray-200 px-2 py-1 rounded text-xs">client/src/App.tsx</code> to customize this page.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <a 
              href="https://react.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Learn React
            </a>
            <a 
              href="https://vitejs.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Vite Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App