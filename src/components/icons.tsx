import type { ReactNode, SVGProps } from "react";

/**
 * 自绘图标集
 * 统一 24×24 网格、1.7px 线宽、圆头圆角，替代 emoji，视觉更整齐。
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
    size?: number;
};

function Icon({
    size = 20,
    children,
    ...rest
}: IconProps & { children: ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...rest}
        >
            {children}
        </svg>
    );
}

export function PenIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 20.4l1-4.2L15.9 5.3a2.05 2.05 0 0 1 2.9 2.9L7.9 19.2l-3.9 1.2z" />
            <path d="M14.6 6.6l2.9 2.9" />
            <path d="M5 20.4l3.1-3.1" />
        </Icon>
    );
}

export function EraserIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M8.6 20H20" />
            <path d="M15.6 4.9l3.5 3.5a1.6 1.6 0 0 1 0 2.3l-7.4 7.4a1.6 1.6 0 0 1-2.3 0l-3.5-3.5a1.6 1.6 0 0 1 0-2.3l7.4-7.4a1.6 1.6 0 0 1 2.3 0z" />
            <path d="M8.7 8.4l6.9 6.9" />
        </Icon>
    );
}

export function UndoIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 9h9.5a5.5 5.5 0 0 1 0 11H9" />
            <path d="M4 9l4.5-4.5" />
            <path d="M4 9l4.5 4.5" />
        </Icon>
    );
}

export function RedoIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M20 9h-9.5a5.5 5.5 0 0 0 0 11H15" />
            <path d="M20 9l-4.5-4.5" />
            <path d="M20 9l-4.5 4.5" />
        </Icon>
    );
}

export function TrashIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 6.5h16" />
            <path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
            <path d="M6.3 6.5l1 13a1.3 1.3 0 0 0 1.3 1.2h6.8a1.3 1.3 0 0 0 1.3-1.2l1-13" />
            <path d="M10.3 10.5v6M13.7 10.5v6" />
        </Icon>
    );
}

export function DownloadIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 3.5v11" />
            <path d="M7.5 10.5L12 15l4.5-4.5" />
            <path d="M4 19.5h16" />
        </Icon>
    );
}

export function SunIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
        </Icon>
    );
}

export function MoonIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M20.5 14.6A8.9 8.9 0 0 1 9.4 3.5a8.9 8.9 0 1 0 11.1 11.1z" />
        </Icon>
    );
}

export function SparkIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M10.5 3.5l1.7 4.6 4.6 1.7-4.6 1.7-1.7 4.6-1.7-4.6L4.2 9.8l4.6-1.7z" />
            <path d="M17.6 15.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
        </Icon>
    );
}

export function UserIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="8.2" r="3.7" />
            <path d="M4.8 20c.6-3.6 3.5-5.7 7.2-5.7s6.6 2.1 7.2 5.7" />
        </Icon>
    );
}

export function ArrowIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4.5 12h15" />
            <path d="M13.5 6l6 6-6 6" />
        </Icon>
    );
}

export function CheckIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4.5 12.5l5 5 10-11" />
        </Icon>
    );
}

export function LayersIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 3.5l8.5 4.6-8.5 4.6-8.5-4.6z" />
            <path d="M3.5 12.2l8.5 4.6 8.5-4.6" />
            <path d="M3.5 16.4l8.5 4.6 8.5-4.6" />
        </Icon>
    );
}

export function GridIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" />
            <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
        </Icon>
    );
}
