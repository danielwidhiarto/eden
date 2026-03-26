import { Sidebar } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-eden-bg">
        <Sidebar />
        <main className="pl-16 lg:pl-56">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
