import Link from "next/link";
import NavControls from "./NavControls";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-cream/90 px-4 py-2 backdrop-blur">
      <Link href="/" className="flex items-center gap-1.5 text-sm font-extrabold text-brown">
        🦊 여우점
      </Link>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">BETA</span>
        <NavControls />
      </div>
    </header>
  );
}
