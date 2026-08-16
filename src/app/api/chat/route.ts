import { NextRequest } from "next/server";
import { Agent } from "@/server/ai/agent";
import { ResponseInterceptor } from "@/server/utils/response";

// GET: 获取模型配置或测试连接
export async function GET(request: NextRequest) {
    const prompt = request.nextUrl.searchParams.get("prompt");

    try {
        const agent = new Agent();

        if (prompt) {
            const reply = await agent.invoke({ prompt });
            return ResponseInterceptor.success(reply, "请求成功");
        }

        const alive = await agent.ping();
        return alive
            ? ResponseInterceptor.ok("AI 服务连接正常")
            : ResponseInterceptor.error("AI 服务不可用", 503);
    } catch (error) {
        return ResponseInterceptor.catch(error);
    }
}
