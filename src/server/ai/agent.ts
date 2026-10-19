import type { ChatOpenAI } from "@langchain/openai";
import { type ModelConfig, ModelFactory } from "./model";

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
    async invoke(prompt: string): Promise<string> {
        const result = await this.llm.invoke(prompt);
        return typeof result.content === "string"
            ? result.content
            : JSON.stringify(result.content);
    }

    /**
     * 健康检查
     * 注意:每次 ping 都会真实调用一次 LLM(消耗 token),只用于探活,不要高频调用
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
