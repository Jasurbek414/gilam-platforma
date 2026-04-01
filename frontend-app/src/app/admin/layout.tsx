import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 ml-72 flex flex-col">
        <Topbar />
        
        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
