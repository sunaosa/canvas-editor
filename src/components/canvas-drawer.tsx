"use client";

import {
    App,
    Button,
    Card,
    ColorPicker,
    Divider,
    Segmented,
    Slider,
    Space,
    Typography,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useTheme } from "../app/theme-provider";

const { Text, Title } = Typography;

type Tool = "pen" | "eraser";

const PRESET_COLORS = [
    "#000000",
    "#e11d48",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
];

export default function CanvasDrawer() {
    const { theme } = useTheme();
    const { message } = App.useApp();

    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const lastRef = useRef<{ x: number; y: number } | null>(null);

    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState<string>("#1e293b");
    const [size, setSize] = useState<number>(6);

    /** 设置 canvas 物理像素 = 容器宽 × dpr,并按 dpr scale,避免线条糊 */
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const dpr =
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const cssWidth = wrap.clientWidth;
        const cssHeight = Math.max(360, Math.round(window.innerHeight * 0.6));
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cssWidth, cssHeight);
    }, []);

    useEffect(() => {
        resizeCanvas();
        const ro = new ResizeObserver(() => resizeCanvas());
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [resizeCanvas]);

    /** 根据鼠标/触屏坐标(CSS px)计算落点 */
    const pointFromEvent = (
        e: React.PointerEvent<HTMLCanvasElement>,
    ): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const beginStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drawingRef.current = true;
        lastRef.current = pointFromEvent(e);
        // 单击一下也画一个点
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { x, y } = lastRef.current;
        ctx.beginPath();
        ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
    };

    const moveStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const point = pointFromEvent(e);
        const last = lastRef.current ?? point;
        ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        lastRef.current = point;
    };

    const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
        drawingRef.current = false;
        lastRef.current = null;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // pointer 已经被释放时 releasePointerCapture 会抛错,忽略
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr =
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        try {
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `canvas-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            message.success("已保存为 PNG");
        } catch {
            message.error("保存失败,请重试");
        }
    };

    return (
        <Wrap>
            <Title
                level={3}
                style={{ color: theme.colors.text, margin: "0 0 16px" }}
            >
                ✏️ 手绘画板
            </Title>

            <Card
                bordered
                style={{
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                }}
                styles={{ body: { padding: 16 } }}
            >
                <Toolbar>
                    <Space size={16} wrap>
                        <FieldGroup>
                            <Label
                                style={{ color: theme.colors.textSecondary }}
                            >
                                工具
                            </Label>
                            <Segmented
                                value={tool}
                                onChange={(v) => setTool(v as Tool)}
                                options={[
                                    { label: "✏️ 画笔", value: "pen" },
                                    { label: "🧽 橡皮", value: "eraser" },
                                ]}
                            />
                        </FieldGroup>

                        <Divider
                            type="vertical"
                            style={{
                                height: 28,
                                borderColor: theme.colors.border,
                            }}
                        />

                        <FieldGroup>
                            <Label
                                style={{ color: theme.colors.textSecondary }}
                            >
                                颜色
                            </Label>
                            <Space size={6} align="center">
                                <ColorPicker
                                    value={color}
                                    onChange={(c: Color) =>
                                        setColor(c.toHexString())
                                    }
                                    disabled={tool === "eraser"}
                                    presets={[
                                        {
                                            label: "推荐",
                                            colors: PRESET_COLORS,
                                        },
                                    ]}
                                />
                                <Swatches>
                                    {PRESET_COLORS.map((c) => (
                                        <SwatchButton
                                            key={c}
                                            type="button"
                                            $active={color === c}
                                            $color={c}
                                            onClick={() => {
                                                setColor(c);
                                                setTool("pen");
                                            }}
                                            aria-label={`color-${c}`}
                                            disabled={tool === "eraser"}
                                        />
                                    ))}
                                </Swatches>
                            </Space>
                        </FieldGroup>

                        <Divider
                            type="vertical"
                            style={{
                                height: 28,
                                borderColor: theme.colors.border,
                            }}
                        />

                        <FieldGroup>
                            <Label
                                style={{ color: theme.colors.textSecondary }}
                            >
                                粗细 {size}px
                            </Label>
                            <Slider
                                min={1}
                                max={40}
                                value={size}
                                onChange={setSize}
                                style={{ width: 140 }}
                            />
                        </FieldGroup>
                    </Space>

                    <Space>
                        <Button onClick={handleClear}>清空</Button>
                        <Button type="primary" onClick={handleSave}>
                            保存 PNG
                        </Button>
                    </Space>
                </Toolbar>

                <Hint style={{ color: theme.colors.textSecondary }}>
                    提示:支持鼠标和触摸,可在画板内自由绘制。
                </Hint>

                <CanvasWrap
                    ref={wrapRef}
                    $border={theme.colors.border}
                    style={{
                        boxShadow: theme.darkMode
                            ? "0 8px 24px rgba(0,0,0,0.4)"
                            : "0 8px 24px rgba(0,0,0,0.08)",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        onPointerDown={beginStroke}
                        onPointerMove={moveStroke}
                        onPointerUp={endStroke}
                        onPointerCancel={endStroke}
                        onPointerLeave={endStroke}
                        style={{
                            display: "block",
                            touchAction: "none",
                            cursor: tool === "eraser" ? "cell" : "crosshair",
                        }}
                    />
                </CanvasWrap>

                <Text
                    style={{
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                        display: "block",
                        marginTop: 8,
                    }}
                >
                    未登录也能使用,如需对话请登录后点击右上角机器人。
                </Text>
            </Card>
        </Wrap>
    );
}

const Wrap = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
`;

const Toolbar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 12px;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.span`
    font-size: 12px;
`;

const Swatches = styled.div`
    display: inline-flex;
    gap: 4px;
    margin-left: 4px;
`;

const SwatchButton = styled.button<{ $color: string; $active: boolean }>`
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid
        ${({ $active, $color }) => ($active ? $color : "transparent")};
    background: ${({ $color }) => $color};
    cursor: pointer;
    padding: 0;
    &:hover {
        transform: scale(1.1);
    }
    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const Hint = styled.div`
    font-size: 12px;
    margin-bottom: 8px;
`;

const CanvasWrap = styled.div<{ $border: string }>`
    width: 100%;
    border: 1px solid ${({ $border }) => $border};
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
`;
