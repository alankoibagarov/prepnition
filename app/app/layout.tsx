import Sidebar from "@/components/Sidebar";
import { requireAuth } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="min-h-full flex">
      <Sidebar session={session} />
      <main className="flex-1 min-h-screen md:ml-56 h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
