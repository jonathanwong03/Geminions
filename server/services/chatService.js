const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const https = require('https');
const path = require('path');

// Helper to download image from URL if needed
const downloadImage = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
            res.on('error', (err) => reject(err));
        });
    });
};

async function analyzeLogoChat(imageInput, history, promptText) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Missing Gemini API Key in environment variables.");
        throw new Error("GEMINI_API_KEY not set");
    }

    const systemInstruction = `You are a professional Design Consultant and Logo Expert. 
    Your goal is to critique and improve user logos. 
    Analyze the uploaded image. Provide constructive feedback on shape, color, typography, and scalability.
    
    Do not provide any numerical scores or JSON output. Just provide helpful, professional text analysis.
    `;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction 
    });

    let imageBuffer;
    let mimeType;

    console.log(`Analyzing Image: Type=${imageInput.type}, Path=${imageInput.path}`);

    if (imageInput.type === 'file') {
        imageBuffer = fs.readFileSync(imageInput.path);
        mimeType = imageInput.mimetype;
    } else if (imageInput.type === 'url') {
        if (imageInput.path.includes('/generated/')) {
            const filename = imageInput.path.split('/').pop(); 
            const localPath = path.join(__dirname, '..', 'generated', filename);
            console.log(`Resolving local path: ${localPath}`);

            if (fs.existsSync(localPath)) {
                imageBuffer = fs.readFileSync(localPath);
                mimeType = 'image/png'; 
                if (imageInput.mimetype) mimeType = imageInput.mimetype;
            } else {
                 console.error(`File not found at resolved path: ${localPath}`);
                 throw new Error("Local image file not found on server.");
            }
        } else {
             throw new Error("Cannot process external URLs yet without download logic");
        }
    }

    if (!imageBuffer) throw new Error("No image data found");

    const chatSession = model.startChat({
        history: history.map(h => ({
            role: h.role, // 'user' or 'model'
            parts: [{ text: h.text }]
        }))
    });

    try {
        const parts = [];
        
        parts.push({
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType || "image/png"
            }
        });

        const finalPrompt = (promptText || "Analyze this logo.");
        parts.push({ text: finalPrompt });

        const result = await chatSession.sendMessage(parts);
        const text = result.response.text();
        
        return { analysis: text };

    } catch (e) {
        console.error("Chat Error", e);
        return { analysis: "Error analyzing image: " + e.message };
    }
}

module.exports = { analyzeLogoChat };
