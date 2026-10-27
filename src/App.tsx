import { useState } from 'react';
import { AppShell, type RouteId } from '@/components/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { DirectoryPage } from '@/pages/DirectoryPage';
import { CitiesPage } from '@/pages/CitiesPage';
import { SignalsPage } from '@/pages/SignalsPage';
import { BriefPage } from '@/pages/BriefPage';
import { MethodologyPage } from '@/pages/MethodologyPage';

function App() {
  const [route, setRoute] = useState<RouteId>('dashboard');
  const [directoryCompanyId, setDirectoryCompanyId] = useState<string | undefined>(undefined);

  const openCompany = (id: string) => {
    setDirectoryCompanyId(id);
    setRoute('directory');
  };

  const navigate = (r: RouteId) => {
    setRoute(r);
    if (r !== 'directory') setDirectoryCompanyId(undefined);
  };

  return (
    <AppShell current={route} onNavigate={navigate}>
      {route === 'dashboard' && <DashboardPage onNavigate={navigate} onOpenCompany={openCompany} />}
      {route === 'directory' && <DirectoryPage initialCompanyId={directoryCompanyId} onClearInitial={() => setDirectoryCompanyId(undefined)} />}
      {route === 'cities' && <CitiesPage />}
      {route === 'signals' && <SignalsPage />}
      {route === 'brief' && <BriefPage />}
      {route === 'methodology' && <MethodologyPage />}
    </AppShell>
  );
}

export default App;
