import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex">
      <Sidebar />
      <main className="flex-1 min-h-screen md:ml-56 h-screen overflow-auto">{children}</main>
    </div>
  );
}
