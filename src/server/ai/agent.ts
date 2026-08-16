import { ModelFactory, type ModelConfig } from "./model";
import type { ChatOpenAI } from "@langchain/openai";

export interface AgentInvokeOptions {
    prompt: string;
    systemPrompt?: string;
    config?: ModelConfig;
}

/**
 * AI Agent
 * 封装 LangChain 模型调用，提供统一的对话入口
 */
export class Agent {
    private readonly llm: ChatOpenAI;

    constructor(config: ModelConfig = {}) {
        this.llm = ModelFactory.create(config);
    }

    /**
     * 单轮对话
     */
    async invoke(options: AgentInvokeOptions): Promise<string> {
        const result = await this.llm.invoke(options.prompt);
        return typeof result.content === "string"
            ? result.content
            : JSON.stringify(result.content);
    }

    /**
     * 健康检查
     */
    async ping(): Promise<boolean> {
        try {
            await this.llm.invoke("ping");
            return true;
        } catch {
            return false;
        }
    }
}
