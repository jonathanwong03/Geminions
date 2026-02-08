import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, MessageSquare, Zap, Image as ImageIcon, Trash2, Edit, X } from 'lucide-react';
import Header from '../components/Header';

const Projects = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedProjects, setGeneratedProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const fileInputRef = useRef(null);
  const promptInputRef = useRef(null);

  const fetchProjects = async () => {
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      // Filter out 'analysis' type projects to show only generated assets
      const response = await fetch(`${serverUrl}/api/projects?excludeType=analysis`, {
         credentials: 'include' // Important for session cookie
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    // Clear the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
      setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setPrompt('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Remove focus from input if needed
    if (promptInputRef.current) promptInputRef.current.blur();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
        const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            setGeneratedProjects(prev => prev.filter(p => p.id !== id));
        } else {
            alert("Failed to delete project");
        }
    } catch (error) {
        console.error("Error deleting project", error);
    }
  };

  const handleRate = async (id, type, value) => {
      try {
          const payload = {};
          if (type === 'brand') payload.brandScore = value;
          if (type === 'satisfaction') payload.satisfactionScore = value;

          const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
          const response = await fetch(`${serverUrl}/api/projects/${id}/rate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              credentials: 'include'
          });

          if (response.ok) {
              setGeneratedProjects(prev => prev.map(p => {
                  if (p.id === id) {
                      return { ...p, ...payload };
                  }
                  return p;
              }));
          }
      } catch (error) {
          console.error("Error rating project", error);
      }
  };

  const handleEdit = async (project) => {
    try {
        // Fetch the image to turn it back into a file
        const response = await fetch(project.imageUrl);
        const blob = await response.blob();
        
        // Create a file from the blob
        const filename = project.imageUrl.split('/').pop() || 'image.png';
        const file = new File([blob], filename, { type: blob.type });

        setSelectedFiles([file]);
        setPrompt("Edit: ");
        setEditingProjectId(project.id);
        
        // Scroll to top and focus
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (promptInputRef.current) promptInputRef.current.focus();

    } catch (error) {
        console.error("Failed to prepare edit", error);
        alert("Could not load image for editing.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt && selectedFiles.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (editingProjectId) {
          formData.append('projectId', editingProjectId);
      }
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('http://localhost:3000/api/remix', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Refresh list to get new IDs and consistent data
        fetchProjects();

        setPrompt('');
        setSelectedFiles([]);
        setEditingProjectId(null); // Reset edit mode
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating assets:', error);
      alert('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Header 
        title="Projects" 
        subtitle="The Agency Interface & Generative Core"
      >
       
      </Header>

      <div className="minion-card" style={{ marginBottom: '20px', padding: '30px', background: 'linear-gradient(135deg, #0057ae 0%, #0077ee 100%)', color: 'white' }}>
         <h2 style={{marginTop: 0}}>Create from Brief</h2>
         <p style={{ opacity: 0.9, maxWidth: '600px', lineHeight: '1.6' }}>
            Enter unstructured inputs like meeting transcripts or rough notes. Our <strong>Agency Interface</strong> will convert them into precise design briefs.
         </p>
         
         <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '5px', borderRadius: '8px', alignItems: 'center' }}>
                 <input 
                    type="text" 
                    value={prompt}
                    ref={promptInputRef}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your campaign or attached images..." 
                    style={{ border: 'none', padding: '15px', flex: 1, outline: 'none' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                 />
                 
                 <label 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#666', margin: 0 }}
                    title="Attach images"
                 >
                    <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />
                    <ImageIcon size={20} color={selectedFiles.length > 0 ? '#0077ee' : '#999'} />
                 </label>

                 {editingProjectId && (
                     <button 
                        onClick={cancelEdit}
                        style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', color: '#666', fontSize: '0.9rem', marginRight: '5px' }}
                     >
                        Cancel
                     </button>
                 )}

                 <button 
                    className="btn-secondary" 
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{ whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', background: editingProjectId ? '#ff9800' : '' }}
                 >
                     <Zap size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }}/> 
                     {loading ? 'Processing...' : (editingProjectId ? 'Update Asset' : 'Generate Assets')}
                 </button>
            </div>
            
            {/* Image Preview & Management Area */}
            {selectedFiles.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {selectedFiles.map((file, index) => (
                        <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                            <img 
                                src={URL.createObjectURL(file)} 
                                alt="preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <button
                                onClick={() => removeFile(index)}
                                style={{ 
                                    position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', 
                                    border: 'none', cursor: 'pointer', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', fontSize: '14px', padding: 0
                                }}
                                title="Remove image"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, alignSelf: 'center', marginLeft: '5px' }}>
                        {selectedFiles.length} images attached
                    </div>
                </div>
            )}
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {generatedProjects.map((project) => (
          <div key={project.id} className="minion-card" style={{ position: 'relative' }}>
            <div style={{ height: '300px', background: '#eee', borderRadius: '10px', marginBottom: '15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{project.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{new Date(project.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => handleEdit(project)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                        title="Edit / Remix Project"
                    >
                        <Edit size={20} />
                    </button>
                    <button 
                        onClick={() => handleDelete(project.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                        title="Delete Project"
                    >
                        <Trash2 size={20} />
                    </button>
                    {/* <MoreHorizontal size={20} color="#999" style={{ cursor: 'pointer' }} /> */}
                </div>
            </div>
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, padding: '10px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--minion-blue)' }}>
                        {(project.brandScore || 0) * 10}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>Brand Score</div>
                    <select 
                        value={project.brandScore || 0}
                        onChange={(e) => handleRate(project.id, 'brand', Number(e.target.value))}
                        style={{ width: '100%', fontSize: '0.8rem', padding: '2px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                         <option value="0">-</option>
                         {[...Array(11).keys()].slice(1).map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, padding: '10px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffcc00' }}>
                        {(project.satisfactionScore || 0) * 10}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>Satisfaction</div>
                    <select 
                        value={project.satisfactionScore || 0}
                        onChange={(e) => handleRate(project.id, 'satisfaction', Number(e.target.value))}
                        style={{ width: '100%', fontSize: '0.8rem', padding: '2px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                         <option value="0">-</option>
                         {[...Array(11).keys()].slice(1).map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>
          </div>
        ))}

        {generatedProjects.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#888' }}>
                No projects yet. Start by generating one!
            </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
