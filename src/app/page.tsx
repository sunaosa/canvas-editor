import CanvasDrawer from "@/components/canvas-drawer";
import TopNav from "@/components/top-nav";

export default function HomePage() {
    return (
        <>
            <TopNav />
            <main style={{ padding: 24 }}>
                <CanvasDrawer />
            </main>
        </>
    );
}
