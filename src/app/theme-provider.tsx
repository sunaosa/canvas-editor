"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import { App, ConfigProvider, theme, Switch, Typography } from "antd";
import type { ThemeConfig } from "antd";

const { Text } = Typography;

/** 自定义主题颜色（非 antd DOM 使用） */
export interface CustomTheme {
    darkMode: boolean;
    colors: {
        primary: string;
        background: string;
        backgroundSecondary: string;
        text: string;
        textSecondary: string;
        border: string;
        card: string;
        gradient: string;
    };
}

/** 主题 Context */
const ThemeContext = createContext<{
    theme: CustomTheme;
    toggleTheme: () => void;
} | null>(null);

/** 获取主题颜色配置 */
function getThemeColors(darkMode: boolean): CustomTheme["colors"] {
    if (darkMode) {
        return {
            primary: "#818cf8",
            background: "#0f172a",
            backgroundSecondary: "#1e293b",
            text: "#f8fafc",
            textSecondary: "#94a3b8",
            border: "#334155",
            card: "#1e293b",
            gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        };
    }
    return {
        primary: "#667eea",
        background: "#f8fafc",
        backgroundSecondary: "#ffffff",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        card: "#ffffff",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    };
}

function ThemeProvider({ children }: { children: ReactNode }) {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => setDarkMode((prev) => !prev);

    const customTheme: CustomTheme = {
        darkMode,
        colors: getThemeColors(darkMode),
    };

    const antdTheme: ThemeConfig = {
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: darkMode ? "#818cf8" : "#667eea",
            borderRadius: 8,
            colorBgContainer: darkMode ? "#1e293b" : "#ffffff",
            colorBgElevated: darkMode ? "#1e293b" : "#ffffff",
            colorText: darkMode ? "#f8fafc" : "#1e293b",
            colorTextSecondary: darkMode ? "#94a3b8" : "#64748b",
            colorBorder: darkMode ? "#334155" : "#e2e8f0",
        },
    };

    return (
        <ThemeContext.Provider value={{ theme: customTheme, toggleTheme }}>
            <ConfigProvider theme={antdTheme}>
                <App
                    message={{ duration: 2 }}
                    notification={{ placement: "topRight" }}
                >
                    <div
                        style={{
                            ...styles.container,
                            background: customTheme.colors.gradient,
                        }}
                    >
                        {/* 主题切换按钮 */}
                        <div style={styles.themeToggle(darkMode)}>
                            <Switch
                                checked={darkMode}
                                onChange={toggleTheme}
                                checkedChildren="🌙"
                                unCheckedChildren="☀️"
                            />
                            <Text style={{ marginLeft: 8, color: darkMode ? "#f8fafc" : "#1e293b" }}>
                                {darkMode ? "深色模式" : "浅色模式"}
                            </Text>
                        </div>

                        {children}
                    </div>
                </App>
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

const styles = {
    container: {
        minHeight: "100vh",
        transition: "background 0.3s ease",
    },
    themeToggle: (darkMode: boolean): React.CSSProperties => ({
        position: "fixed" as const,
        top: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        backgroundColor: darkMode ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)",
        borderRadius: 8,
        border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
    }),
};

export default ThemeProvider;
