// components/DebugPanel.js - Temporary component for debugging
'use client';

import { useState } from 'react';
import { runSupabaseDiagnostics, quickTest } from '../lib/supabaseDiagnostic.js';

export default function DebugPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await runSupabaseDiagnostics();
      setResults(diagnosticResults);
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickTest = async () => {
    console.log('Running quick test...');
    const success = await quickTest();
    alert(success ? 'Quick test passed!' : 'Quick test failed - check console');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-3">🔧 Debug Panel</h3>
      
      <div className="space-y-2">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isRunning ? 'Running...' : 'Run Full Diagnostics'}
        </button>
        
        <button
          onClick={runQuickTest}
          className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Quick Test
        </button>
        
        <button
          onClick={() => console.log('Manual test - check console')}
          className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
        >
          Open Console
        </button>
      </div>

      {results && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
          <strong>Results:</strong>
          <div className="mt-1 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Check browser console for detailed logs
      </div>
    </div>
  );
}