import React, { useState, useEffect } from 'react';
import { Layout, Smartphone, Monitor, Video, Layers, X, Check, Loader } from 'lucide-react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const Templates = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [generating, setGenerating] = useState(false);
    const abortControllerRef = React.useRef(null);
    const navigate = useNavigate();

    // Environment variable for API calls
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

    const categories = ['All', 'Social Media', 'Ads', 'Presentations', 'Video'];

    const templates = [
        { name: 'Instagram Story', category: 'Social Media', icon: <Smartphone size={24} /> },
        { name: 'LinkedIn Banner', category: 'Social Media', icon: <Monitor size={24} /> },
        { name: 'Twitter header', category: 'Social Media', icon: <Monitor size={24} /> },
        { name: 'YouTube Thumbnail', category: 'Video', icon: <Video size={24} /> },
        { name: 'TikTok Video', category: 'Video', icon: <Smartphone size={24} /> },
        { name: 'Reels 9:16', category: 'Video', icon: <Smartphone size={24} /> },
        { name: 'Carousel Ad', category: 'Ads', icon: <Layers size={24} /> },
        { name: 'Facebook Ad', category: 'Ads', icon: <Layers size={24} /> },
        { name: 'Display Banner', category: 'Ads', icon: <Layers size={24} /> },
        { name: 'Pitch Slide 16:9', category: 'Presentations', icon: <Layout size={24} /> },
        { name: 'A4 One Pager', category: 'Presentations', icon: <Layout size={24} /> },
    ];

    const filteredTemplates = activeCategory === 'All' 
        ? templates 
        : templates.filter(t => t.category === activeCategory);

    const handleTemplateClick = async (template) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
        // Fetch projects to choose from
        try {
            const res = await fetch(`${serverUrl}/api/projects?excludeType=analysis`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    const handleCancel = () => {
        if (generating && abortControllerRef.current) {
            abortControllerRef.current.abort();
            setGenerating(false);
            console.log("Generation cancelled by user");
        }
        setIsModalOpen(false);
    };

    const handleGenerate = async () => {
        if (!selectedProjectId) return alert("Please select a project source.");
        
        setGenerating(true);
        abortControllerRef.current = new AbortController();

        try {
            const res = await fetch(`${serverUrl}/api/template/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    templateName: selectedTemplate.name,
                    templateType: selectedTemplate.category
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert("Assets generated successfully! Redirecting to Exports...");
                setIsModalOpen(false);
                navigate('/exports');
            } else {
                alert("Generation failed");
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error("Error generating template", error);
                alert("Error connecting to server");
            }
        } finally {
            setGenerating(false);
            abortControllerRef.current = null;
        }
    };

    return (
        <div style={{ padding: '20px', position: 'relative' }}>
            <Header 
                title="Context-Aware Templates"
                subtitle="Automatically adapt designs for different channels"
            />

            <div className="minion-card" style={{ marginBottom: '30px', borderLeft: '5px solid var(--minion-blue)' }}>
                <h3 style={{ marginTop: 0 }}>Automatic Adaptation Active</h3>
                <p>
                    When you select a template, our system intelligently moves logos and text to ensure legibility and safe-zone compliance across platforms (Instagram Stories, LinkedIn Banners, etc.).
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{ 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        border: '1px solid #ddd', 
                        background: cat === activeCategory ? '#333' : 'white', 
                        color: cat === activeCategory ? 'white' : '#333',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}>
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {filteredTemplates.map((template, i) => (
                    <div 
                        key={i} 
                        className="minion-card template-card" 
                        onClick={() => handleTemplateClick(template)}
                        style={{ cursor: 'pointer', textAlign: 'center', padding: '40px 20px', transition: 'transform 0.2s' }}
                    >
                        <div style={{ 
                            width: '60px', height: '60px', 
                            background: 'var(--minion-yellow)', 
                            borderRadius: '50%', 
                            margin: '0 auto 20px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#333'
                        }}>
                            {template.icon}
                        </div>
                        <h3 style={{ margin: '0 0 10px 0' }}>{template.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Smart Layout Ready</p>
                    </div>
                ))}
            </div>

            {/* Modal for Project Selection */}
            {isModalOpen && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                    <div className="minion-card" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Customise {selectedTemplate?.name}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        
                        <p>Select a source project/image to adapt to this format:</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginBottom: '30px', maxHeight: '300px', overflowY: 'auto' }}>
                            {projects.map(p => (
                                <div 
                                    key={p.id} 
                                    onClick={() => setSelectedProjectId(p.id)}
                                    style={{ 
                                        border: selectedProjectId === p.id ? '3px solid var(--minion-blue)' : '1px solid #ddd', 
                                        borderRadius: '8px', 
                                        overflow: 'hidden', 
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                                    <div style={{ padding: '5px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                                    {selectedProjectId === p.id && (
                                        <div style={{ position: 'absolute', top: 5, right: 5, background: 'var(--minion-blue)', color: 'white', borderRadius: '50%', padding: '2px' }}>
                                            <Check size={12} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>



                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={handleCancel} className="btn-secondary">Cancel</button>
                            <button 
                                onClick={handleGenerate} 
                                className="btn-primary" 
                                disabled={generating || !selectedProjectId}
                                style={{ opacity: (!selectedProjectId || generating) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {generating && <Loader className="spin" size={16} />}
                                {generating ? 'Adapting...' : 'Generate & Export'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;
