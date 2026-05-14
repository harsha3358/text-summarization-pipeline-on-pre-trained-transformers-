import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Loader2, AlignLeft, Scissors } from 'lucide-react';
import './index.css';

function App() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  const [mode, setMode] = useState('abstractive'); // 'abstractive' or 'extractive'
  
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
          setLoadingText(`Downloading ${mode === 'abstractive' ? 'distilbart' : 'MiniLM'} AI Model... (${e.data.file || 'loading'})`);
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
          setSummary('An error occurred during summarization. Please make sure the text is long enough.');
          setIsLoading(false);
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, [mode]);

  const handleSummarize = () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setSummary('');
    setLoadingProgress(0);
    // Send the text and mode to the worker for processing
    worker.current.postMessage({ text, mode });
  };

  return (
    <>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="app-container">
        <header className="header">
          <h1 className="title">AI TL;DR ✨</h1>
          <p className="subtitle">Skip the yap. Get straight to the point.</p>
        </header>

        <main className="glass-card">
          <div className="textarea-container">
            
            {/* Mode Toggle */}
            <div className="mode-toggle">
              <button 
                className={`mode-btn ${mode === 'abstractive' ? 'active' : ''}`}
                onClick={() => setMode('abstractive')}
                disabled={isLoading}
                title="AI rewrites the text to be shorter"
              >
                <Sparkles size={16} style={{display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom'}} />
                Vibe Translate (Rewrite)
              </button>
              <button 
                className={`mode-btn ${mode === 'extractive' ? 'active' : ''}`}
                onClick={() => setMode('extractive')}
                disabled={isLoading}
                title="AI extracts the most important exact sentences"
              >
                <Scissors size={16} style={{display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom'}} />
                No Cap (Extract Facts)
              </button>
            </div>

            <textarea
              className="textarea"
              placeholder={`Drop your main character monologue here... 💅\n\n${mode === 'abstractive' ? 'Vibe Translate: The AI will rewrite your text so it passes the vibe check.' : 'No Cap Mode: The AI will extract only the absolute facts (most semantically important sentences).'}`}
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
                  Cooking...
                </>
              ) : (
                <>
                  <AlignLeft />
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
            <div className="result-container glass-card" style={{marginTop: '1rem'}}>
              <h2 className="result-title">
                {mode === 'abstractive' ? <Sparkles size={20} /> : <Scissors size={20} />}
                {mode === 'abstractive' ? 'The Vibe (TL;DR)' : 'The Facts (Extracted)'}
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
