import React from 'react';
import { Download, CheckCircle, FileImage, FileVideo } from 'lucide-react';
import Header from '../components/Header';

const Exports = () => {
  return (
    <div style={{ padding: '20px' }}>
       <Header 
         title="Export Center"
         subtitle="Download your context-aware adapted assets"
       />

        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '15px 20px', color: '#666' }}>Asset Name</th>
                    <th style={{ padding: '15px 20px', color: '#666' }}>Format</th>
                    <th style={{ padding: '15px 20px', color: '#666' }}>Project</th>
                    <th style={{ padding: '15px 20px', color: '#666' }}>Status</th>
                    <th style={{ padding: '15px 20px', color: '#666' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {[
                    { name: 'Campaign_Main_IG.png', type: 'image', format: 'PNG', project: 'Summer Launch' },
                    { name: 'Campaign_Story_Video.mp4', type: 'video', format: 'MP4', project: 'Summer Launch' },
                    { name: 'Banner_LinkedIn.jpg', type: 'image', format: 'JPG', project: 'B2B Outreach' },
                ].map((file, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                            {file.type === 'image' ? <FileImage size={18} color="#666"/> : <FileVideo size={18} color="#666"/>}
                            {file.name}
                        </td>
                        <td style={{ padding: '15px 20px', color: '#666' }}>{file.format}</td>
                        <td style={{ padding: '15px 20px' }}>{file.project}</td>
                        <td style={{ padding: '15px 20px' }}>
                            <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle size={12} /> Ready
                            </span>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                            <button className="btn-secondary" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                                <Download size={14} style={{ marginRight: '5px' }} /> Download
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default Exports;
