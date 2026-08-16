import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/styled-registry";
import ThemeProvider from "./theme-provider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Canvas Next",
    description: "Canvas Next.js application",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <StyledComponentsRegistry>
                    <ThemeProvider>{children}</ThemeProvider>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}
