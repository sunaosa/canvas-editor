import { ChatOpenAI } from "@langchain/openai";

export interface ModelConfig {
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
}

/**
 * AI 模型工厂
 * 通过 LangChain 的 ChatOpenAI 兼容任意 OpenAI 兼容接口
 */
export class ModelFactory {
    private static readonly defaultConfig: Required<ModelConfig> = {
        temperature: 0.7,
        maxTokens: 2048,
        streaming: false,
    };

    static create(config: ModelConfig = {}): ChatOpenAI {
        return new ChatOpenAI({
            model: process.env.MODEL_NAME!,
            apiKey: process.env.API_KEY!,
            temperature: config.temperature ?? ModelFactory.defaultConfig.temperature,
            maxTokens: config.maxTokens ?? ModelFactory.defaultConfig.maxTokens,
            streaming: config.streaming ?? ModelFactory.defaultConfig.streaming,
            configuration: {
                baseURL: process.env.MODEL_URL,
            },
        });
    }
}
