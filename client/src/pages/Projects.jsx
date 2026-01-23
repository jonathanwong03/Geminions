import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, MessageSquare, Zap } from 'lucide-react';
import Header from '../components/Header';

const Projects = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateAssets = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new generated image to the list
        const newImage = {
          id: Date.now(),
          imageData: data.imageData,
          mimeType: data.mimeType || 'image/png',
          prompt: prompt,
          timestamp: new Date().toLocaleString(),
        };

        setGeneratedImages([newImage, ...generatedImages]);
        setPrompt(''); // Clear the input
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleGenerateAssets();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Header
        title="Projects"
        subtitle="The Agency Interface & Generative Core"
      >
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> New Project
        </button>
      </Header>

      <div className="minion-card" style={{ marginBottom: '20px', padding: '30px', background: 'linear-gradient(135deg, #0057ae 0%, #0077ee 100%)', color: 'white' }}>
        <h2 style={{ marginTop: 0 }}>Create from Brief</h2>
        <p style={{ opacity: 0.9, maxWidth: '600px', lineHeight: '1.6' }}>
          Enter unstructured inputs like meeting transcripts or rough notes. Our <strong>Agency Interface</strong> will convert them into precise design briefs.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Describe your campaign..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            style={{
              border: 'none',
              padding: '15px',
              flex: 1,
              opacity: isLoading ? 0.6 : 1
            }}
          />
          <button
            className="btn-secondary"
            style={{ whiteSpace: 'nowrap' }}
            onClick={handleGenerateAssets}
            disabled={isLoading}
          >
            <Zap size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            {isLoading ? 'Generating...' : 'Generate Assets'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '5px' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Generated Images */}
        {generatedImages.map((image) => (
          <div key={image.id} className="minion-card">
            <div style={{
              height: '150px',
              background: '#eee',
              borderRadius: '10px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={`data:${image.mimeType};base64,${image.imageData}`}
                alt="Generated asset"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>Generated Asset</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Generated {image.timestamp}</p>
              </div>
              <MoreHorizontal size={20} color="#999" style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', color: 'var(--minion-blue)', fontWeight: 'bold' }}>
                <MessageSquare size={14} /> Prompt
              </div>
              {image.prompt}
            </div>
          </div>
        ))}

        {/* Static Example Cards */}
        {[1, 2].map((i) => (
          <div key={`example-${i}`} className="minion-card">
            <div style={{ height: '150px', background: '#eee', borderRadius: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              Preview Image
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>Summer Campaign {i}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Generated 2 hours ago</p>
              </div>
              <MoreHorizontal size={20} color="#999" style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', color: 'var(--minion-blue)', fontWeight: 'bold' }}>
                <MessageSquare size={14} /> Reasoning
              </div>
              Aligns with strategic goals by emphasizing product freshness.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
