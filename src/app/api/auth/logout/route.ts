import { NextRequest } from "next/server";
import { ResponseInterceptor } from "@/server/utils/response";

export async function POST(_request: NextRequest) {
    const response = ResponseInterceptor.ok("退出登录成功");
    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
    return response;
}
