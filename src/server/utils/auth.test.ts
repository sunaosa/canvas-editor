import { describe, expect, it } from "vitest";
import {
    extractToken,
    hashPassword,
    signToken,
    verifyPassword,
    verifyToken,
} from "./auth";

describe("密码哈希", () => {
    it("hash 后可验证正确密码,拒绝错误密码", async () => {
        const hash = await hashPassword("s3cret-password");
        expect(hash).not.toContain("s3cret-password");
        await expect(verifyPassword("s3cret-password", hash)).resolves.toBe(
            true,
        );
        await expect(verifyPassword("wrong-password", hash)).resolves.toBe(
            false,
        );
    });
});

describe("JWT 签发与验证", () => {
    it("signToken 后 verifyToken 能还原 payload", () => {
        const token = signToken({ uid: 1, sub: "uuid-1", username: "alice" });
        const payload = verifyToken(token);
        expect(payload).toMatchObject({
            uid: 1,
            sub: "uuid-1",
            username: "alice",
        });
    });

    it("垃圾/篡改 token 返回 null 而不是抛错", () => {
        expect(verifyToken("not-a-jwt")).toBeNull();
        expect(verifyToken("aaa.bbb.ccc")).toBeNull();
    });
});

describe("extractToken", () => {
    it("优先取 Authorization Bearer", () => {
        expect(extractToken("Bearer abc", "cookie-token")).toBe("abc");
    });

    it("无 Bearer header 时回退 cookie", () => {
        expect(extractToken(null, "cookie-token")).toBe("cookie-token");
    });

    it("两者都没有时返回 null", () => {
        expect(extractToken(null, undefined)).toBeNull();
        expect(extractToken(undefined, null)).toBeNull();
    });
});
