import { NextRequest } from "next/server";
import { CreateMinimax } from "../../server/llm/minimax";
import { ResponseInterceptor } from "../../server/utils/response";

// GET: 获取模型配置或测试连接
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get("prompt");

    try {
        const minimax = new CreateMinimax();
        // 如果有 prompt 参数，进行测试对话
        if (prompt) {
            const llm = minimax.create();
            const response = await llm.invoke(`${prompt}`);
            return ResponseInterceptor.success(response.content, "请求成功");
        }

        // 无 prompt 时返回配置信息
        return ResponseInterceptor.ok("MiniMax API 连接正常");
    } catch (error) {
        return ResponseInterceptor.catch(error);
    }
}
