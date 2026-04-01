import CompanySidebar from '@/components/layout/CompanySidebar';
import Topbar from '@/components/layout/Topbar';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Fixed Sidebar tailored for the specific company */}
      <CompanySidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Topbar />
        
        {/* Page content with refined padding and background */}
        <main className="flex-1 p-6 md:p-10 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
