const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const MODEL_NAME = "gemini-3-pro-image-preview";

async function remixImages(imagePaths, prompt, outputDir) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // The gemini-2.5-flash-image-preview model requires v1alpha API version.
    // apiVersion must be passed in the RequestOptions (second argument), not the model config.
    const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
        }
    }, { apiVersion: "v1alpha" });

    const imageParts = imagePaths.map(filePath => fileToGenerativePart(filePath, getMimeType(filePath)));
    
    // The prompt is also a part
    const promptPart = { text: prompt };
    
    // Combine parts: images + prompt
    const generatedContent = await model.generateContentStream([promptPart, ...imageParts]);

    const generatedFiles = [];
    let fileIndex = 0;

    for await (const chunk of generatedContent.stream) {
        const chunkText = chunk.text(); // Just for logging/debugging if needed
        if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
            for (const part of chunk.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const timestamp = Date.now();
                    // Guess extension from mimeType
                    const mimeType = part.inlineData.mimeType;
                    const ext = mimeType.split('/')[1] || 'png'; // default fallback
                    const fileName = `remixed_image_${timestamp}_${fileIndex}.${ext}`;
                    const filePath = path.join(outputDir, fileName);
                    
                    const buffer = Buffer.from(part.inlineData.data, 'base64');
                    fs.writeFileSync(filePath, buffer);
                    generatedFiles.push(fileName);
                    fileIndex++;
                }
            }
        }
    }
    
    return generatedFiles;
}

function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.png': return 'image/png';
        case '.jpeg':
        case '.jpg': return 'image/jpeg';
        case '.webp': return 'image/webp';
        case '.heic': return 'image/heic';
        case '.heif': return 'image/heif';
        default: return 'image/jpeg'; // fallback
    }
}

module.exports = { remixImages };
