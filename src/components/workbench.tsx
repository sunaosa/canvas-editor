"use client";

import { App, ColorPicker, Slider, Tooltip } from "antd";
import type { Color } from "antd/es/color-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useTheme } from "@/app/theme-provider";
import {
    DownloadIcon,
    EraserIcon,
    PenIcon,
    RedoIcon,
    TrashIcon,
    UndoIcon,
} from "./icons";

type Tool = "pen" | "eraser";

/** 预设色板：偏绘画用色的顺序排列 */
const PRESET_COLORS = [
    "#14181d",
    "#d6451f",
    "#e8a33d",
    "#2f8f5b",
    "#2f6bd8",
    "#7a4bd8",
    "#d2418a",
];

/** 撤销栈上限，避免长时间绘制占用过多内存 */
const MAX_HISTORY = 24;

export default function Workbench() {
    const { theme } = useTheme();
    const { message } = App.useApp();

    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const lastRef = useRef<{ x: number; y: number } | null>(null);
    const midRef = useRef<{ x: number; y: number } | null>(null);

    const toolRef = useRef<Tool>("pen");
    const colorRef = useRef("#14181d");
    const sizeRef = useRef(6);

    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const restoringRef = useRef(false);

    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#14181d");
    const [size, setSize] = useState(6);
    const [strokes, setStrokes] = useState(0);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [clearArmed, setClearArmed] = useState(false);

    toolRef.current = tool;
    colorRef.current = color;
    sizeRef.current = size;

    /** 取得 2D 上下文（已按 dpr 缩放） */
    const getCtx = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        return ctx;
    }, []);

    /** 画布尺寸跟随容器，并按 dpr 放大物理像素，避免线条发虚 */
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = Math.max(320, wrap.clientWidth);
        const cssHeight = Math.max(280, wrap.clientHeight);
        const prev = canvas.width ? canvas.toDataURL() : null;

        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        setCanvasSize({ w: canvas.width, h: canvas.height });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // 尺寸变化后恢复已有笔迹
        if (prev) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, cssWidth, cssHeight);
            };
            img.src = prev;
        }
    }, []);

    useEffect(() => {
        resizeCanvas();
        const ro = new ResizeObserver(() => resizeCanvas());
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [resizeCanvas]);

    /** 把当前画布内容压入撤销栈 */
    const pushHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || restoringRef.current) return;
        const snapshot = canvas.toDataURL("image/png");
        const history = historyRef.current.slice(
            0,
            historyIndexRef.current + 1,
        );
        history.push(snapshot);
        if (history.length > MAX_HISTORY) history.shift();
        historyRef.current = history;
        historyIndexRef.current = history.length - 1;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(false);
    }, []);

    // 记录初始空白状态，这样第一次撤销可以回到一张白纸
    useEffect(() => {
        pushHistory();
    }, [pushHistory]);

    /** 载入一张快照 */
    const restore = useCallback((dataUrl: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        restoringRef.current = true;
        const img = new Image();
        img.onload = () => {
            const dpr = window.devicePixelRatio || 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            restoringRef.current = false;
        };
        img.onerror = () => {
            restoringRef.current = false;
        };
        img.src = dataUrl;
    }, []);

    const undo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        restore(historyRef.current[historyIndexRef.current]);
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(true);
    }, [restore]);

    const redo = useCallback(() => {
        const history = historyRef.current;
        if (historyIndexRef.current >= history.length - 1) return;
        historyIndexRef.current += 1;
        restore(history[historyIndexRef.current]);
        setCanUndo(true);
        setCanRedo(historyIndexRef.current < history.length - 1);
    }, [restore]);

    const clear = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        pushHistory();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        setStrokes(0);
        message.success("画板已清空");
    }, [getCtx, message, pushHistory]);

    const savePng = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        try {
            // 画布本身透明，导出时补一层白纸底
            const out = document.createElement("canvas");
            out.width = canvas.width;
            out.height = canvas.height;
            const octx = out.getContext("2d");
            if (!octx) return;
            octx.fillStyle = "#ffffff";
            octx.fillRect(0, 0, out.width, out.height);
            octx.drawImage(canvas, 0, 0);

            const a = document.createElement("a");
            a.href = out.toDataURL("image/png");
            a.download = `canvas-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            message.success("已导出 PNG");
        } catch {
            message.error("导出失败,请重试");
        }
    }, [message]);

    /** 鼠标/触屏坐标(CSS px) */
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
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drawingRef.current = true;
        const point = pointFromEvent(e);
        lastRef.current = point;
        midRef.current = point;

        const isEraser = toolRef.current === "eraser";
        ctx.save();
        ctx.globalCompositeOperation = isEraser
            ? "destination-out"
            : "source-over";
        ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : colorRef.current;
        ctx.beginPath();
        ctx.arc(point.x, point.y, sizeRef.current / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const moveStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const point = pointFromEvent(e);
        setPointer(point);
        if (!drawingRef.current) return;
        const ctx = getCtx();
        if (!ctx) return;
        const last = lastRef.current ?? point;
        const mid = { x: (last.x + point.x) / 2, y: (last.y + point.y) / 2 };
        const isEraser = toolRef.current === "eraser";

        ctx.save();
        ctx.globalCompositeOperation = isEraser
            ? "destination-out"
            : "source-over";
        ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : colorRef.current;
        ctx.lineWidth = sizeRef.current;
        ctx.beginPath();
        ctx.moveTo(midRef.current?.x ?? last.x, midRef.current?.y ?? last.y);
        ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
        ctx.stroke();
        ctx.restore();

        lastRef.current = point;
        midRef.current = mid;
    };

    const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        lastRef.current = null;
        midRef.current = null;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // pointer 已经被释放时 releasePointerCapture 会抛错,忽略
        }
        pushHistory();
        setStrokes((n) => n + 1);
    };

    const handleClearClick = () => {
        if (!clearArmed) {
            setClearArmed(true);
            window.setTimeout(() => setClearArmed(false), 3000);
            return;
        }
        setClearArmed(false);
        clear();
    };

    // 快捷键：P 画笔 / E 橡皮 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做 / Ctrl+S 导出
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable)
            ) {
                return;
            }
            const mod = e.ctrlKey || e.metaKey;

            if (mod && e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                return;
            }
            if (mod && e.key.toLowerCase() === "s") {
                e.preventDefault();
                savePng();
                return;
            }
            if (!mod && e.key.toLowerCase() === "p") {
                setTool("pen");
                return;
            }
            if (!mod && e.key.toLowerCase() === "e") {
                setTool("eraser");
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [redo, savePng, undo]);

    const brushPreviewSize = Math.min(size, 34);

    return (
        <Board>
            <Rail>
                <RailGroup>
                    <RailButton
                        $active={tool === "pen"}
                        onClick={() => setTool("pen")}
                        aria-label="画笔 (P)"
                        aria-pressed={tool === "pen"}
                    >
                        <PenIcon size={19} />
                    </RailButton>
                    <RailButton
                        $active={tool === "eraser"}
                        onClick={() => setTool("eraser")}
                        aria-label="橡皮 (E)"
                        aria-pressed={tool === "eraser"}
                    >
                        <EraserIcon size={19} />
                    </RailButton>
                </RailGroup>

                <RailDivider />

                <RailGroup>
                    <Tooltip title="撤销 (Ctrl+Z)" placement="right">
                        <RailButton
                            onClick={undo}
                            disabled={!canUndo}
                            aria-label="撤销"
                        >
                            <UndoIcon size={19} />
                        </RailButton>
                    </Tooltip>
                    <Tooltip title="重做 (Ctrl+Shift+Z)" placement="right">
                        <RailButton
                            onClick={redo}
                            disabled={!canRedo}
                            aria-label="重做"
                        >
                            <RedoIcon size={19} />
                        </RailButton>
                    </Tooltip>
                </RailGroup>

                <RailDivider />

                <RailGroup>
                    <Tooltip
                        title={clearArmed ? "再点一次确认清空" : "清空画板"}
                        placement="right"
                    >
                        <RailButton
                            onClick={handleClearClick}
                            $danger={clearArmed}
                            aria-label="清空画板"
                        >
                            <TrashIcon size={19} />
                        </RailButton>
                    </Tooltip>
                    <Tooltip title="导出 PNG (Ctrl+S)" placement="right">
                        <RailButton onClick={savePng} aria-label="导出 PNG">
                            <DownloadIcon size={19} />
                        </RailButton>
                    </Tooltip>
                </RailGroup>
            </Rail>

            <Stage>
                <Sheet ref={wrapRef}>
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
                </Sheet>
            </Stage>

            <Panel>
                <Section>
                    <SectionTitle>墨色</SectionTitle>
                    <Swatches>
                        {PRESET_COLORS.map((c) => (
                            <Swatch
                                key={c}
                                type="button"
                                $color={c}
                                $active={color === c}
                                onClick={() => {
                                    setColor(c);
                                    setTool("pen");
                                }}
                                aria-label={`颜色 ${c}`}
                                aria-pressed={color === c}
                            />
                        ))}
                        <CustomColor>
                            <ColorPicker
                                value={color}
                                disabled={tool === "eraser"}
                                onChange={(c: Color) =>
                                    setColor(c.toHexString())
                                }
                                aria-label="自定义颜色"
                            />
                        </CustomColor>
                    </Swatches>
                </Section>

                <Section>
                    <SectionTitle>笔尖</SectionTitle>
                    <BrushRow>
                        <BrushPreview
                            $color={
                                tool === "eraser" ? theme.colors.inkSoft : color
                            }
                            $size={brushPreviewSize}
                        />
                        <BrushMeta>
                            <BrushValue>{size} px</BrushValue>
                            <BrushHint>
                                {tool === "eraser" ? "橡皮" : "画笔"}
                            </BrushHint>
                        </BrushMeta>
                    </BrushRow>
                    <Slider
                        min={1}
                        max={40}
                        value={size}
                        onChange={(v) => setSize(v as number)}
                    />
                </Section>

                <Section>
                    <SectionTitle>快捷键</SectionTitle>
                    <ShortcutList>
                        <Shortcut>
                            <Key> P </Key>
                            <ShortcutText>画笔</ShortcutText>
                        </Shortcut>
                        <Shortcut>
                            <Key> E </Key>
                            <ShortcutText>橡皮</ShortcutText>
                        </Shortcut>
                        <Shortcut>
                            <Key>Ctrl</Key>
                            <Plus>+</Plus>
                            <Key>Z</Key>
                            <ShortcutText>撤销</ShortcutText>
                        </Shortcut>
                        <Shortcut>
                            <Key>Ctrl</Key>
                            <Plus>+</Plus>
                            <Key>S</Key>
                            <ShortcutText>导出 PNG</ShortcutText>
                        </Shortcut>
                    </ShortcutList>
                </Section>
            </Panel>

            <Status>
                <StatusItem>
                    <StatusLabel>工具</StatusLabel>
                    <StatusValue>
                        {tool === "pen" ? "画笔" : "橡皮"}
                    </StatusValue>
                </StatusItem>
                <StatusItem>
                    <StatusLabel>笔尖</StatusLabel>
                    <StatusValue>{size}px</StatusValue>
                </StatusItem>
                <StatusItem>
                    <StatusLabel>笔迹</StatusLabel>
                    <StatusValue>{strokes}</StatusValue>
                </StatusItem>
                <StatusItem>
                    <StatusLabel>坐标</StatusLabel>
                    <StatusValue>
                        x {Math.round(pointer.x)} · y {Math.round(pointer.y)}
                    </StatusValue>
                </StatusItem>
                <StatusItem>
                    <StatusLabel>画布</StatusLabel>
                    <StatusValue>
                        {canvasSize.w} × {canvasSize.h}
                    </StatusValue>
                </StatusItem>
            </Status>
        </Board>
    );
}

const Board = styled.div`
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr) 268px;
    grid-template-rows: minmax(0, 1fr) 34px;
    height: calc(100vh - 56px);
    min-height: 520px;
    background: ${({ theme }) => theme.colors.boardDeep};

    @media (max-width: 1100px) {
        grid-template-columns: 56px minmax(0, 1fr);
        grid-template-rows: auto minmax(360px, 62vh) auto 34px;
        height: auto;
    }

    @media (max-width: 700px) {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto auto auto;
    }
`;

const Rail = styled.nav`
    grid-column: 1;
    grid-row: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 0;
    background: ${({ theme }) => theme.colors.board};
    border-right: 1px solid ${({ theme }) => theme.colors.rule};

    @media (max-width: 1100px) {
        grid-column: 1 / -1;
        grid-row: 1;
        flex-direction: row;
        justify-content: flex-start;
        padding: 8px 12px;
        border-right: 0;
        border-bottom: 1px solid ${({ theme }) => theme.colors.rule};
        overflow-x: auto;
    }

    @media (max-width: 700px) {
        grid-column: 1;
        grid-row: 1;
    }
`;

const RailGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    @media (max-width: 1100px) {
        flex-direction: row;
    }
`;

const RailDivider = styled.div`
    width: 22px;
    height: 1px;
    background: ${({ theme }) => theme.colors.rule};

    @media (max-width: 1100px) {
        width: 1px;
        height: 22px;
    }
`;

const RailButton = styled.button.attrs({ type: "button" })<{
    $active?: boolean;
    $danger?: boolean;
}>`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: ${({ $active, $danger, theme }) =>
        $danger
            ? theme.colors.accent
            : $active
              ? theme.colors.accentSoft
              : "transparent"};
    color: ${({ $active, $danger, theme }) =>
        $danger
            ? "#ffffff"
            : $active
              ? theme.colors.accent
              : theme.colors.inkSoft};
    cursor: pointer;
    transition:
        background 0.15s ease,
        color 0.15s ease;

    &::before {
        content: "";
        position: absolute;
        left: -1px;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 16px;
        border-radius: 2px;
        background: ${({ $active, theme }) =>
            $active ? theme.colors.accent : "transparent"};
    }

    &:hover:not(:disabled) {
        background: ${({ $active, $danger, theme }) =>
            $danger
                ? theme.colors.accentInk
                : $active
                  ? theme.colors.accentSoft
                  : `color-mix(in srgb, ${theme.colors.ink} 7%, transparent)`};
        color: ${({ $active, $danger, theme }) =>
            $danger
                ? "#ffffff"
                : $active
                  ? theme.colors.accent
                  : theme.colors.ink};
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    @media (max-width: 1100px) {
        &::before {
            left: 50%;
            top: auto;
            bottom: -8px;
            transform: translateX(-50%);
            width: 16px;
            height: 2px;
        }
    }
`;

const Stage = styled.main`
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: 22px;
    overflow: auto;

    @media (max-width: 1100px) {
        grid-column: 2;
        grid-row: 2;
    }

    @media (max-width: 700px) {
        grid-column: 1;
        grid-row: 2;
        padding: 14px;
    }
`;

const Sheet = styled.div`
    position: relative;
    width: 100%;
    min-height: 320px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.sheet};
    background-image:
        linear-gradient(
            to right,
            ${({ theme }) => theme.colors.grid} 1px,
            transparent 1px
        ),
        linear-gradient(
            to bottom,
            ${({ theme }) => theme.colors.grid} 1px,
            transparent 1px
        ),
        linear-gradient(
            to right,
            ${({ theme }) => theme.colors.gridStrong} 1px,
            transparent 1px
        ),
        linear-gradient(
            to bottom,
            ${({ theme }) => theme.colors.gridStrong} 1px,
            transparent 1px
        );
    background-size:
        24px 24px,
        24px 24px,
        120px 120px,
        120px 120px;
    box-shadow: ${({ theme }) => theme.colors.shadow};
    overflow: hidden;
`;

const Panel = styled.aside`
    grid-column: 3;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 20px 18px;
    background: ${({ theme }) => theme.colors.board};
    border-left: 1px solid ${({ theme }) => theme.colors.rule};
    overflow-y: auto;

    @media (max-width: 1100px) {
        grid-column: 1 / -1;
        grid-row: 3;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 28px;
        border-left: 0;
        border-top: 1px solid ${({ theme }) => theme.colors.rule};
    }

    @media (max-width: 700px) {
        grid-column: 1;
        grid-row: 3;
    }
`;

const Section = styled.section`
    min-width: 200px;

    @media (max-width: 1100px) {
        flex: 1 1 220px;
    }
`;

const SectionTitle = styled.h3`
    margin: 0 0 12px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const Swatches = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
`;

const Swatch = styled.button.attrs({ type: "button" })<{
    $color: string;
    $active: boolean;
}>`
    width: 26px;
    height: 26px;
    padding: 0;
    border-radius: 5px;
    border: 1px solid ${({ theme }) => theme.colors.rule};
    background: ${({ $color }) => $color};
    box-shadow: ${({ $active, theme }) =>
        $active
            ? `0 0 0 2px ${theme.colors.sheet}, 0 0 0 4px ${theme.colors.accent}`
            : "none"};
    cursor: pointer;
    transition: transform 0.12s ease;

    &:hover {
        transform: translateY(-1px);
    }
`;

const CustomColor = styled.span`
    display: inline-flex;
    align-items: center;
    margin-left: 2px;
`;

const BrushRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
`;

const BrushPreview = styled.span<{ $color: string; $size: number }>`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex: none;
`;

const BrushMeta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const BrushValue = styled.span`
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 15px;
    color: ${({ theme }) => theme.colors.ink};
`;

const BrushHint = styled.span`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const ShortcutList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Shortcut = styled.li`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12.5px;
`;

const Key = styled.kbd`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 20px;
    padding: 0 5px;
    border: 1px solid ${({ theme }) => theme.colors.rule};
    border-bottom-width: 2px;
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.sheet};
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 11px;
    color: ${({ theme }) => theme.colors.ink};
`;

const Plus = styled.span`
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const ShortcutText = styled.span`
    margin-left: 6px;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const Status = styled.div`
    grid-column: 2 / 4;
    grid-row: 2;
    display: flex;
    align-items: center;
    gap: 26px;
    padding: 0 18px;
    background: ${({ theme }) => theme.colors.board};
    border-top: 1px solid ${({ theme }) => theme.colors.rule};
    overflow-x: auto;

    @media (max-width: 1100px) {
        grid-column: 1 / -1;
        grid-row: 4;
    }

    @media (max-width: 700px) {
        grid-column: 1;
        grid-row: 4;
    }
`;

const StatusItem = styled.div`
    display: flex;
    align-items: baseline;
    gap: 7px;
    white-space: nowrap;
`;

const StatusLabel = styled.span`
    font-size: 11px;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const StatusValue = styled.span`
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 12px;
    color: ${({ theme }) => theme.colors.ink};
`;
