import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/styled-registry";
import ThemeProvider from "./theme-provider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Canvas Editor · 手绘板",
    description:
        "浏览器里的手绘板：多色画笔、撤销重做、PNG 导出，登录后还能和 AI 助手讨论构图。",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body>
                <StyledComponentsRegistry>
                    <ThemeProvider>{children}</ThemeProvider>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}
