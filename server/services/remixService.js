const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const MODEL_NAME = "gemini-3-pro-image-preview";

async function remixImages(imagePaths, prompt, outputDir, signal) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }

    if (signal && signal.aborted) {
        throw new Error("Aborted");
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
    // Pass signal to request options if supported, but definitely check inside loop
    const requestOptions = { 
        apiVersion: "v1alpha",
        signal: signal // attempt to pass signal to SDK
    };
    
    // Explicit check before calling API
    if (signal && signal.aborted) throw new Error("Aborted");

    let generatedFiles = [];
    
    try {
        const generatedContent = await model.generateContentStream([promptPart, ...imageParts], requestOptions);

        let fileIndex = 0;

        for await (const chunk of generatedContent.stream) {
            if (signal && signal.aborted) {
                throw new Error("Aborted");
            }
            
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
    } catch (error) {
        // If aborted, clean up any files that were generated in this session
        if (error.message === "Aborted" || error.name === 'AbortError' || signal?.aborted) {
            console.log("Cleaning up generated files due to abort...");
            for (const file of generatedFiles) {
                try {
                    fs.unlinkSync(path.join(outputDir, file));
                } catch (e) {
                    console.error("Failed to delete file during cleanup:", file);
                }
            }
        }
        throw error;
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
