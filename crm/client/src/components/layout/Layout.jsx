import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AddLeadModal from '../common/AddLeadModal';
import { useCrm } from '../../context/CrmContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const { addLead } = useCrm();

  const handleSaveLead = async (form) => {
    try {
      await addLead(form);
      setAddLeadOpen(false);
    } catch (err) {
      // Error toast already displayed in addLead
    }
  };

  return (
    <div className={`min-h-screen bg-main ${isPipMode ? 'border-4 border-accent' : ''} transition-all duration-300`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <Navbar
          onMenuToggle={() => setSidebarOpen(true)}
          onAddLead={() => setAddLeadOpen(true)}
          isPipMode={isPipMode}
          togglePipMode={() => setIsPipMode(!isPipMode)}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet context={{ openAddLead: () => setAddLeadOpen(true) }} />
        </main>
      </div>
      
      {addLeadOpen && (
        <AddLeadModal
          onClose={() => setAddLeadOpen(false)}
          onSave={handleSaveLead}
        />
      )}
    </div>
  );
}
