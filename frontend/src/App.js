// import React, { useState } from 'react';
// import './App.css';

// function App() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [transcription, setTranscription] = useState('');
//   const [summary, setSummary] = useState('');
//   const [actionItems, setActionItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//     setTranscription('');
//     setSummary('');
//     setActionItems([]);
//     setError('');
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       setError('Please select an audio file first.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     const formData = new FormData();
//     formData.append('audio', selectedFile);

//     try {
//       const response = await fetch('${process.env.REACT_APP_API_URL}/upload-audio', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Something went wrong during upload.');
//       }

//       const data = await response.json();
//       setTranscription(data.transcription);
//       setSummary(data.summary);
//       setActionItems(data.action_items);

//     } catch (err) {
//       setError(err.message);
//       console.error('Upload error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Smart Meeting Summarizer & Action Tracker</h1>
//         <p>Upload an audio file to get a summary and action items.</p>
//       </header>

//       <main>
//         <div className="upload-section">
//           <input type="file" accept="audio/*" onChange={handleFileChange} />
//           <button onClick={handleUpload} disabled={!selectedFile || loading}>
//             {loading ? 'Processing...' : 'Upload & Analyze'}
//           </button>
//         </div>

//         {error && <p className="error-message">{error}</p>}

//         {loading && <p>Analyzing your meeting audio. This might take a moment...</p>}

//         {transcription && (
//           <div className="results-section">
//             <h2>Transcription</h2>
//             <p className="result-box">{transcription}</p>

//             <h2>Summary</h2>
//             <p className="result-box">{summary}</p>

//             <h2>Action Items</h2>
//             {actionItems.length > 0 ? (
//               <ul className="action-items-list result-box">
//                 {actionItems.map((item, index) => (
//                   <li key={index}>{item}</li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="result-box">No action items extracted.</p>
//             )}
//           </div>
//         )}
//       </main>

//       <footer>
//         <p>&copy; TCS AI Hackathon - Smart Meeting Summarizer</p>
//       </footer>
//     </div>
//   );
// }

// export default App;
import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Create a ref for the hidden file input
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setTranscription('');
    setSummary('');
    setActionItems([]);
    setError('');
  };

  const handleFileChange = (event) => {
    resetState();
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Triggers when the file input is clicked
  const onFileSelect = () => {
    fileInputRef.current.click();
  };

  // Drag and drop event handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    resetState();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
    } else {
      setError('Please drop an audio file.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong during upload.');
      }

      const data = await response.json();
      setTranscription(data.transcription || 'No transcription available.');
      setSummary(data.summary || 'No summary available.');
      setActionItems(data.action_items || []);

    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Smart Meeting Summarizer & Action Tracker</h1>
      </header>

      <main>
        <div className="card upload-card">
          <h2>Audio File Upload</h2>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onClick={onFileSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            {selectedFile ? (
              <p>File selected: {selectedFile.name}</p>
            ) : (
              <p>Drag & drop an audio file here, or click to select</p>
            )}
          </div>
          <div className="upload-progress">
             {loading && <div className="progress-bar-fill"></div>}
          </div>
          {loading && <p className="loading-text">Analyzing your meeting audio. This might take a moment...</p>}
          <button onClick={handleUpload} disabled={!selectedFile || loading}>
            {loading ? 'Processing...' : 'Upload & Analyze'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
        
        {transcription && (
          <div className="results-grid">
            <div className="card result-card">
              <h2>Transcription</h2>
              <div className="result-content">
                <p>{transcription}</p>
              </div>
            </div>

            <div className="card result-card">
              <h2>Summary</h2>
              <div className="result-content">
                <p>{summary}</p>
              </div>
            </div>

            <div className="card result-card">
              <h2>Action Items</h2>
              <div className="result-content">
                {actionItems.length > 0 ? (
                  <ul className="action-items-list">
                    {actionItems.map((item, index) => (
                      <li key={index}>
                        <input type="checkbox" id={`item-${index}`} />
                        <label htmlFor={`item-${index}`}>{item}</label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No action items extracted.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>&copy; 2025 TCS AI Hackathon - Smart Meeting Summarizer</p>
      </footer>
    </div>
  );
}

export default App;
