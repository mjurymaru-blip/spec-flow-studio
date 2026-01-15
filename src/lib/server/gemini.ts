/**
 * Gemini API Server Service
 *
 * Google Gemini API との通信を担当するサーバーサイドサービス
 * リクエストごとにAPIキーと設定を受け取り、生成を実行する
 */
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface GenerateOptions {
    apiKey: string;
    modelName: string;
    prompt: string;
    temperature?: number;
}

export async function generateContent({ apiKey, modelName, prompt, temperature = 0.7 }: GenerateOptions) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
            generationConfig: {
                temperature,
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Generate Error:', error);
        throw error;
    }
}

// ストリーミング対応版 (Phase 3.5で本格利用)
export async function generateContentStream({ apiKey, modelName, prompt, temperature = 0.7 }: GenerateOptions) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContentStream(prompt);
        return result.stream;
    } catch (error) {
        console.error('Gemini Stream Error:', error);
        throw error;
    }
}

interface ModelInfo {
    name: string; // models/gemini-pro
    displayName: string;
    description: string;
    supportedGenerationMethods: string[];
}

// モデル一覧を取得 (SDKに機能がない場合があるためREST APIを使用)
export async function listModels(apiKey: string): Promise<ModelInfo[]> {
    try {
        // APIキーを使ってモデル一覧を取得
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // generateContentをサポートしているモデルのみフィルタリング
        return (data.models || []).filter((m: any) =>
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        ).map((m: any) => ({
            name: m.name.replace('models/', ''), // "models/" プレフィックスを除去
            displayName: m.displayName,
            description: m.description,
            supportedGenerationMethods: m.supportedGenerationMethods
        }));
    } catch (error) {
        console.error('Gemini List Models Error:', error);
        throw error;
    }
}
