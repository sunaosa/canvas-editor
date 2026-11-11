"use client";

import type { ThemeConfig } from "antd";
import { App, theme as antdAlgorithm, ConfigProvider } from "antd";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { fontBody, fontDisplay, fontMono } from "@/lib/fonts";

const STORAGE_KEY = "canvas-editor-theme";

/** 设计令牌：制图桌（石墨灰桌面 / 白图纸 / 朱砂红） */
export interface StudioColors {
    /** 桌面 */
    board: string;
    /** 桌面凹陷区（导轨、侧栏） */
    boardDeep: string;
    /** 图纸 */
    sheet: string;
    /** 主墨色（主文字） */
    ink: string;
    /** 次级文字 */
    inkSoft: string;
    /** 细线 */
    rule: string;
    /** 强调色：朱砂 */
    accent: string;
    /** 强调色按下 / 深色模式 */
    accentInk: string;
    /** 强调色浅底 */
    accentSoft: string;
    /** 图纸网格线 */
    grid: string;
    /** 图纸网格主线 */
    gridStrong: string;
    /** 投影 */
    shadow: string;
}

export interface StudioTheme {
    darkMode: boolean;
    colors: StudioColors;
    fonts: {
        display: string;
        body: string;
        mono: string;
    };
}

const LIGHT: StudioColors = {
    board: "#e7eaee",
    boardDeep: "#dde2e8",
    sheet: "#ffffff",
    ink: "#14181d",
    inkSoft: "#5a6472",
    rule: "#ccd3db",
    accent: "#d6451f",
    accentInk: "#b03a18",
    accentSoft: "#fbebe4",
    grid: "#eef1f5",
    gridStrong: "#dfe4ea",
    shadow: "0 1px 2px rgba(20, 24, 29, 0.06), 0 10px 30px rgba(20, 24, 29, 0.10)",
};

const DARK: StudioColors = {
    board: "#12161b",
    boardDeep: "#0c0f13",
    sheet: "#1a1f26",
    ink: "#e9edf3",
    inkSoft: "#98a3b2",
    rule: "#2a313a",
    accent: "#f0653a",
    accentInk: "#ff8258",
    accentSoft: "#2b1a14",
    grid: "#20262d",
    gridStrong: "#28303a",
    shadow: "0 1px 2px rgba(0, 0, 0, 0.5), 0 16px 40px rgba(0, 0, 0, 0.45)",
};

interface ThemeContextValue {
    theme: StudioTheme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
    const [darkMode, setDarkMode] = useState(false);

    // 首次挂载后读取本地偏好，避免 SSR 阶段读到 localStorage 造成闪烁
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved === "dark" || saved === "light") {
                setDarkMode(saved === "dark");
            }
        } catch {
            // 隐私模式下 localStorage 不可用，忽略即可
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setDarkMode((prev) => {
            const next = !prev;
            try {
                window.localStorage.setItem(
                    STORAGE_KEY,
                    next ? "dark" : "light",
                );
            } catch {
                // 同上
            }
            return next;
        });
    }, []);

    const studio = useMemo<StudioTheme>(
        () => ({
            darkMode,
            colors: darkMode ? DARK : LIGHT,
            fonts: { display: fontDisplay, body: fontBody, mono: fontMono },
        }),
        [darkMode],
    );

    const antdTheme = useMemo<ThemeConfig>(
        () => ({
            algorithm: darkMode
                ? antdAlgorithm.darkAlgorithm
                : antdAlgorithm.defaultAlgorithm,
            token: {
                colorPrimary: studio.colors.accent,
                colorInfo: studio.colors.accent,
                colorSuccess: "#1f8a5b",
                colorWarning: "#b7791f",
                colorError: "#c0392b",
                colorText: studio.colors.ink,
                colorTextSecondary: studio.colors.inkSoft,
                colorBorder: studio.colors.rule,
                colorSplit: studio.colors.rule,
                colorBgLayout: studio.colors.board,
                colorBgContainer: studio.colors.sheet,
                colorBgElevated: studio.colors.sheet,
                borderRadius: 6,
                controlHeight: 38,
                fontFamily: fontBody,
            },
            components: {
                Button: { fontWeight: 500, primaryShadow: "none" },
                Input: {
                    activeShadow: `0 0 0 3px ${studio.colors.accent}26`,
                },
            },
        }),
        [darkMode, studio],
    );

    return (
        <ThemeContext.Provider value={{ theme: studio, toggleTheme }}>
            <ConfigProvider theme={antdTheme}>
                <StyledThemeProvider theme={studio}>
                    <App
                        message={{ duration: 2, maxCount: 2 }}
                        notification={{ placement: "topRight" }}
                    >
                        <div
                            style={{
                                minHeight: "100vh",
                                background: studio.colors.board,
                                color: studio.colors.ink,
                                colorScheme: darkMode ? "dark" : "light",
                            }}
                        >
                            {children}
                        </div>
                    </App>
                </StyledThemeProvider>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}

/** Hook：获取主题 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}

export default ThemeProvider;
