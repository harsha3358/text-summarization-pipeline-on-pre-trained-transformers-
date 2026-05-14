import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  
  // Create a reference to the worker object
  const worker = useRef(null);

  useEffect(() => {
    // Create the worker inside a useEffect to ensure it only runs on the client
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    // Handle messages from the worker
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'progress':
          setLoadingText(`Downloading AI Model... (${e.data.file || 'loading'})`);
          if (e.data.progress) {
            setLoadingProgress(e.data.progress);
          }
          break;
        case 'ready':
          setLoadingText('Processing text...');
          setLoadingProgress(100);
          break;
        case 'complete':
          setSummary(e.data.output);
          setIsLoading(false);
          setLoadingProgress(0);
          setLoadingText('Initializing AI...');
          break;
        case 'error':
          console.error(e.data.error);
          setSummary('An error occurred during summarization.');
          setIsLoading(false);
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const handleSummarize = () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setSummary('');
    // Send the text to the worker for processing
    worker.current.postMessage({ text });
  };

  return (
    <>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="app-container">
        <header className="header">
          <h1 className="title">AI TL;DR</h1>
          <p className="subtitle">Zero latency. Infinite scale. Pure magic.</p>
        </header>

        <main className="glass-card">
          <div className="textarea-container">
            <textarea
              className="textarea"
              placeholder="Paste your long, boring text here and watch the AI do its thing..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
            
            <button 
              className="btn" 
              onClick={handleSummarize}
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles />
                  Make it Short
                  <ArrowRight />
                </>
              )}
            </button>
          </div>

          {isLoading && loadingProgress > 0 && loadingProgress < 100 && (
            <div className="loader-container">
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{loadingText}</span>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {summary && (
            <div className="result-container glass-card">
              <h2 className="result-title">
                <Sparkles size={20} color="var(--primary-color)" />
                The TL;DR
              </h2>
              <p className="result-text">{summary}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
