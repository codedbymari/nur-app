// src/components/ClientErrorHandler.js
'use client'
import { useEffect } from 'react'

export default function ClientErrorHandler() {
  useEffect(() => {
    // Suppress Grammarly hydration warnings
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && 
          (args[0].includes('Extra attributes from the server') ||
           args[0].includes('data-new-gr-c-s-check-loaded') ||
           args[0].includes('data-gr-ext-installed'))) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null; 
}