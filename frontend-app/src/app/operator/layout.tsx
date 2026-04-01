import OperatorSidebar from '@/components/layout/OperatorSidebar';
import Topbar from '@/components/layout/Topbar';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <OperatorSidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-10 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full italic">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
