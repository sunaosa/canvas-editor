import type { NextRequest } from "next/server";
import { clearAuthCookie } from "@/server/utils/cookies";
import { ResponseInterceptor } from "@/server/utils/response";

export async function POST(_request: NextRequest) {
    const response = ResponseInterceptor.ok("退出登录成功");
    clearAuthCookie(response);
    return response;
}
