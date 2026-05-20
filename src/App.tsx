import { useState } from 'react';

const PASSWORD = 'password';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Type some text to summarize or read aloud.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [provider, setProvider] = useState<'chatgpt' | 'claude'>('chatgpt');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue === PASSWORD) {
      setIsUnlocked(true);
      setError('');
      return;
    }
    setError('Incorrect password. Please try again.');
  };

  const handleGenerateSummary = async () => {
    if (!documentText.trim()) {
      setError('Please type text before generating a summary.');
      return;
    }

    setError('');
    setIsProcessing(true);
    setStatusMessage(`Sending text to ${provider === 'chatgpt' ? 'ChatGPT' : 'Claude'}...`);
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, text: documentText.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error || response.statusText || 'Unable to summarize text. Please try again.';
        throw new Error(message);
      }

      const data = await response.json();
      const assistantText = data?.summary;

      if (!assistantText) {
        throw new Error('The summarization service returned an empty response.');
      }

      setSummary(assistantText.trim());
      setStatusMessage('Summary ready.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(message);
      setStatusMessage('Failed to generate summary.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReadText = () => {
    if (!documentText.trim()) {
      setError('Please type text before reading it aloud.');
      return;
    }

    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis is not supported in this browser.');
      return;
    }

    setError('');
    setIsSpeaking(true);
    setStatusMessage('Reading text aloud...');

    const utterance = new SpeechSynthesisUtterance(documentText);
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusMessage('Text read aloud completed.');
    };
    utterance.onerror = () => {
      setError('Unable to read the text aloud.');
      setIsSpeaking(false);
      setStatusMessage('Ready.');
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (!isUnlocked) {
    return (
      <main className="app-shell">
        <div className="password-card">
          <h1>Enter Password</h1>
          <p>Please enter the password to continue.</p>
          <form className="password-form" onSubmit={handleSubmit}>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="password-input"
              autoFocus
            />
            <button type="submit" className="password-button">
              Unlock
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="password-card">
        <section className="summary-header">
          <h1>Text Summarizer</h1>
          <p>
            Type text below and use the controls to summarize it or read it aloud.
          </p>
        </section>

        <section className="upload-section">
          <label className="field-label" htmlFor="typed-text">
            Enter text to summarize
          </label>
          <textarea
            id="typed-text"
            value={documentText}
            onChange={(event) => setDocumentText(event.target.value)}
            className="text-area"
            rows={10}
            placeholder="Type or paste your document text here..."
          />

          <div className="provider-row">
            <label className="field-label" htmlFor="provider-select">
              AI provider
            </label>
            <select
              id="provider-select"
              value={provider}
              onChange={(event) => setProvider(event.target.value as 'chatgpt' | 'claude')}
              className="provider-select"
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
            </select>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="primary-button"
              onClick={handleGenerateSummary}
              disabled={isProcessing || !documentText.trim()}
            >
              {isProcessing ? 'Summarizing…' : 'Generate Summary'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleReadText}
              disabled={isSpeaking || !documentText.trim()}
            >
              {isSpeaking ? 'Reading…' : 'Read Text Aloud'}
            </button>
          </div>

          <p className="status-message">{statusMessage}</p>
          {error && <p className="error-message">{error}</p>}
        </section>

        {summary && (
          <section className="summary-output">
            <h2>Summary Output</h2>
            <pre>{summary}</pre>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
