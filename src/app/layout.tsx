import type { Metadata } from "next";
import ThemeProvider from "./theme-provider";

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
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
