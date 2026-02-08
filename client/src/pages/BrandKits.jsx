import React, { useState, useEffect, useRef } from 'react';
import { Upload, MessageSquare, Send, Image as ImageIcon, ShieldCheck, ChevronDown } from 'lucide-react';
import Header from '../components/Header';

const BrandKits = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false); 
  
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const res = await fetch(`${serverUrl}/api/projects`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (e) { console.error("Error fetching projects", e); }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
     if (chatBottomRef.current) {
         chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  }, [chatHistory]);

  const handleFileChange = (e) => {
    try {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          
          // Revoke old URL if it was a blob
          if (previewUrl && previewUrl.startsWith('blob:')) {
             try { URL.revokeObjectURL(previewUrl); } catch(e) {}
          }
          
          setUploadedFile(file);
          setSelectedProject(null);
          
          // Create new URL safely
          try {
              const objUrl = URL.createObjectURL(file);
              setPreviewUrl(objUrl);
          } catch (urlError) {
              console.error("Failed to create object URL", urlError);
              setPreviewUrl(null); // Fallback or Error state
          }

          setChatHistory([{ role: 'model', text: "I'm ready! Upload an image or select a project to get started with your expert logo analysis." }]);
          
          // Clear input value to ensure change event fires next time even for same file
          e.target.value = null; 
      }
    } catch (err) {
        console.error("Critical Error in handleFileChange", err);
    }
  };

  const handleProjectSelect = (e) => {
      const projectId = e.target.value;
      if (!projectId) return;
      const project = projects.find(p => p.id == projectId);
      if (project) {
          setSelectedProject(project);
          setUploadedFile(null);
          setPreviewUrl(project.imageUrl);

          if (project.chatHistory && project.chatHistory.length > 0) {
              setChatHistory(project.chatHistory);
          } else {
              setChatHistory([{ role: 'model', text: `Loaded project: ${project.title}. How can I help you improve this asset?` }]);
          }
      }
  };

  const handleSendMessage = async () => {
      if ((!message && chatHistory.length > 0) || !previewUrl) return;
      
      const userMsg = message || "Analyze this logo.";
      const newHistory = [...chatHistory, { role: 'user', text: userMsg }];
      setChatHistory(newHistory);
      setMessage('');
      setIsTyping(true);

      const formData = new FormData();
      formData.append('message', userMsg);
      // Filter out system messages AND the initial welcome message if it's the first one in history
      // Gemini API requires history to start with user or be empty if it's the first turn
      const validHistory = chatHistory.filter((h, index) => {
         if (h.role === 'system') return false;
         // If it's the very first message and it's from model (our welcome message), skip it
         if (index === 0 && h.role === 'model') return false;
         return true;
      });
      formData.append('history', JSON.stringify(validHistory));
      
      if (uploadedFile) {
          formData.append('image', uploadedFile);
      } else if (selectedProject) {
          formData.append('projectId', selectedProject.id);
      }

      try {
          const res = await fetch(`${serverUrl}/api/chat/analyze`, {
              method: 'POST',
              body: formData,
              credentials: 'include'
          });
          
          if (res.ok) {
              const data = await res.json();
              setChatHistory(prev => [...prev, { role: 'model', text: data.analysis }]);
              
              if (data.project) {
                  setProjects(prev => [...prev, data.project]);
                  setSelectedProject(data.project);
                  setUploadedFile(null);
                  setPreviewUrl(data.project.imageUrl);
              }
          } else {
              setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I had trouble analyzing that. Please try again." }]);
          }
      } catch (err) {
          console.error("Chat error", err);
          setChatHistory(prev => [...prev, { role: 'model', text: "Connection error." }]);
      } finally {
          setIsTyping(false);
      }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
       <Header 
         title="Brand DNA & Analysis"
         subtitle="Expert Logo Consultation & Validation"
       />

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
           
           <div>
               <div className="minion-card" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                   <div style={{ flex: 1 }}>
                       <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>Upload New Asset</label>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <Upload size={16} /> Upload Image
                               <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                           </label>
                           {uploadedFile && <span style={{ fontSize: '0.85rem' }}>{uploadedFile.name}</span>}
                       </div>
                   </div>
                   
                   

                   <div style={{ flex: 1.3 }}>
                       <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '20px'}}>Or Select Generated Project</label>
                       <div style={{ position: 'relative' }}>
                            <select 
                                onChange={handleProjectSelect} 
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', appearance: 'none', background: 'white' }}
                                value={selectedProject?.id || ''}
                            >
                                <option value="">-- Choose from History --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} ({new Date(p.createdAt).toLocaleDateString()})</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '13px', pointerEvents: 'none', color: '#666' }} />
                       </div>
                   </div>
               </div>

               <div className="minion-card" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', position: 'relative', overflow: 'hidden' }}>
                    
                    {!previewUrl ? (
                         <div style={{ textAlign: 'center', color: '#999' }}>
                             <ImageIcon size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                             <p>Select or upload a logo to begin analysis</p>
                         </div>
                    ) : (
                        <img src={previewUrl} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }} alt="Analysis Target" />
                    )}
               </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               


               <div className="minion-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', height: '600px' }}>
                   <div style={{ padding: '15px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                       <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <MessageSquare size={16} /> Logo Expert
                       </h3>
                   </div>
                   
                   <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#fff' }}>
                       {chatHistory.length === 0 && (
                           <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: '0.9rem' }}>
                               <p>I specialize in logo enhancements.</p>
                               <p>Upload a logo or select a project, then ask me anything!</p>
                           </div>
                       )}
                       
                       {chatHistory.map((msg, i) => (
                           <div key={i} style={{ 
                               marginBottom: '15px', 
                               textAlign: msg.role === 'user' ? 'right' : 'left' 
                           }}>
                               <div style={{ 
                                   display: 'inline-block', 
                                   maxWidth: '85%', 
                                   padding: '10px 15px', 
                                   borderRadius: '15px',
                                   borderTopRightRadius: msg.role === 'user' ? '2px' : '15px',
                                   borderTopLeftRadius: msg.role === 'model' ? '2px' : '15px',
                                   background: msg.role === 'user' ? 'var(--minion-blue)' : '#f1f3f4',
                                   color: msg.role === 'user' ? 'white' : '#333',
                                   fontSize: '0.9rem',
                                   lineHeight: '1.5'
                               }}>
                                   {msg.text}
                               </div>
                           </div>
                       ))}
                       {isTyping && (
                           <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                               <div style={{ display: 'inline-block', padding: '10px 15px', background: '#f1f3f4', borderRadius: '15px', borderTopLeftRadius: '2px' }}>
                                   <span className="dot-typing">...</span>
                               </div>
                           </div>
                       )}
                       <div ref={chatBottomRef}></div>
                   </div>

                   <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                       <input 
                            type="text" 
                            placeholder={previewUrl ? "Ask for feedback..." : "Upload image first..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={!previewUrl || isTyping}
                            style={{ flex: 1, border: '1px solid #ddd', borderRadius: '20px', padding: '10px 15px', outline: 'none' }}
                       />
                       <button 
                            className="btn-primary" 
                            onClick={handleSendMessage}
                            disabled={!previewUrl || isTyping}
                            style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                       >
                           <Send size={18} />
                       </button>
                   </div>
               </div>

           </div>
       </div>

       <style>{`
         .dot-typing { font-weight: bold; color: #666; animation: blink 1.5s infinite; }
         @keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
       `}</style>
    </div>
  );
};

export default BrandKits;
