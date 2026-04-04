import OperatorSidebar from '@/components/layout/OperatorSidebar';
import Topbar from '@/components/layout/Topbar';
import { ChatProvider } from '@/context/ChatContext';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <div className="flex bg-slate-50 min-h-screen">
        <OperatorSidebar />

        <div className="flex-1 ml-72 flex flex-col min-h-screen">
          <Topbar />
          
          <main className="flex-1 p-3 lg:p-4 overflow-auto bg-slate-50/50">
            <div className="w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}
