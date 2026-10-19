import type { NextRequest } from "next/server";
import { Agent } from "@/server/ai/agent";
import { requireAuth } from "@/server/utils/require-auth";
import { ResponseInterceptor } from "@/server/utils/response";

// GET: 获取模型配置或测试连接(需登录)
export async function GET(request: NextRequest) {
    // proxy 只校验 token 是否存在,这里才是真正的验签 + 账号状态校验
    const auth = await requireAuth(request);
    if (!auth) {
        return ResponseInterceptor.unauthorized("未登录或登录已过期");
    }

    const prompt = request.nextUrl.searchParams.get("prompt");

    try {
        const agent = new Agent();

        if (prompt) {
            const reply = await agent.invoke(prompt);
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
