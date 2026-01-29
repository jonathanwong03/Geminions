const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// Initialize the AI client. It automatically uses the GOOGLE_API_KEY env var.
const ai = new GoogleGenAI({});

/**
 * Generate an image using Gemini 2.5 Flash Image model
 * @param {string} prompt - The text prompt describing the image to generate
 * @returns {Promise<{success: boolean, imageData?: string, error?: string}>}
 */
async function generateImage(prompt) {
    const modelName = "gemini-2.5-flash-image";

    try {
        console.log(`[Gemini] Generating image with prompt: "${prompt}"`);

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });

        // The image data is in the 'inlineData' part of the response
        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageData = imagePart.inlineData.data;
            console.log('[Gemini] Image generated successfully');

            return {
                success: true,
                imageData: base64ImageData,
                mimeType: imagePart.inlineData.mimeType || 'image/png'
            };
        } else {
            console.log('[Gemini] No image data received in response');
            return {
                success: false,
                error: 'No image data received from Gemini'
            };
        }
    } catch (error) {
        console.error('[Gemini] Error generating image:');
        console.error('Error message:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));

        // Check if it's a quota/rate limit error
        if (error.status === 429 || error.name === 'ApiError') {
            return {
                success: false,
                error: 'API quota exceeded. The Gemini 2.5 Flash Image model has reached its free tier limit. Please try again later or upgrade your plan.',
                isQuotaError: true
            };
        }

        return {
            success: false,
            error: error.message || 'Failed to generate image'
        };
    }
}

module.exports = { generateImage };
