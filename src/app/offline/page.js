// src/app/offline/page.js
'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    
    try {
      // Test connection by trying to fetch the main page
      const response = await fetch('/', { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      
      if (response.ok) {
        // Connection restored, redirect to home
        window.location.href = '/';
      }
    } catch (error) {
      console.log('Still offline, retry failed');
    }
  };

  useEffect(() => {
    // Auto-redirect when back online
    if (isOnline) {
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          {isOnline ? (
            <Wifi className="w-16 h-16 mx-auto text-green-500" />
          ) : (
            <WifiOff className="w-16 h-16 mx-auto text-red-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {isOnline ? (
            'Great! Your internet connection has been restored. Redirecting you back to the app...'
          ) : (
            'It looks like you\'re not connected to the internet. Please check your connection and try again.'
          )}
        </p>

        {/* Status indicator */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={isOnline}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryCount > 0 ? `Retry (${retryCount})` : 'Try Again'}
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 text-left">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Troubleshooting Tips:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Check your WiFi or mobile data connection</li>
            <li>• Try turning airplane mode on and off</li>
            <li>• Restart your browser or app</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </div>

        {/* App info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            NUR App • Offline Mode
          </p>
        </div>
      </div>
    </div>
  );
}