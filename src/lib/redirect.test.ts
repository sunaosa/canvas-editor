import { describe, expect, it } from "vitest";
import { safeRedirect } from "./redirect";

describe("safeRedirect", () => {
    it("站内路径原样放行", () => {
        expect(safeRedirect("/chat")).toBe("/chat");
        expect(safeRedirect("/canvas/1")).toBe("/canvas/1");
        expect(safeRedirect("/")).toBe("/");
    });

    it("空值回落默认页", () => {
        expect(safeRedirect(null)).toBe("/chat");
        expect(safeRedirect(undefined)).toBe("/chat");
        expect(safeRedirect("")).toBe("/chat");
    });

    it("外站地址被拒绝(开放重定向防护)", () => {
        expect(safeRedirect("https://evil.com")).toBe("/chat");
        // 协议相对 URL 同样能跳外站,必须拦截
        expect(safeRedirect("//evil.com")).toBe("/chat");
        expect(safeRedirect("javascript:alert(1)")).toBe("/chat");
    });

    it("支持自定义回落页", () => {
        expect(safeRedirect("https://evil.com", "/home")).toBe("/home");
    });
});
