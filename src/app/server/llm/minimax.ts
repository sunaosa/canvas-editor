import { ChatOpenAI } from "@langchain/openai"
type MinimaxConfig = {
  temperature?: number
  maxTokens?: number
  streaming?: boolean
}

export class CreateMinimax {
    private defaultConfig: MinimaxConfig = {
        temperature: 0.7,
        maxTokens: 2048,
        streaming: false,
    }

    create(config: MinimaxConfig = {}): ChatOpenAI {
        return new ChatOpenAI({
            model: process.env.MODEL_NAME!,
            apiKey: process.env.API_KEY!,
            temperature: config.temperature ?? this.defaultConfig.temperature,
            maxTokens: config.maxTokens ?? this.defaultConfig.maxTokens,
            streaming: config.streaming ?? this.defaultConfig.streaming,
            configuration: {
                baseURL: process.env.MODEL_URL,
            },
        })
    }
}