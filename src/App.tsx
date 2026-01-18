import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import MasterPerusahaan from "@/pages/master/Perusahaan";
import MasterDepartemen from "@/pages/master/Departemen";
import MasterJabatan from "@/pages/master/Jabatan";
import MasterKaryawan from "@/pages/master/Karyawan";
import MasterJenisPekerjaan from "@/pages/master/JenisPekerjaan";
import PengajuanPage from "@/pages/pengajuan/Index";
import UserManagement from "@/pages/settings/UserManagement";
import RoleManagement from "@/pages/settings/RoleManagement";
import Threshold from "@/pages/settings/Threshold";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="master/perusahaan" element={<MasterPerusahaan />} />
              <Route path="master/departemen" element={<MasterDepartemen />} />
              <Route path="master/jabatan" element={<MasterJabatan />} />
              <Route path="master/jenis-pekerjaan" element={<MasterJenisPekerjaan />} />
              <Route path="master/karyawan" element={<MasterKaryawan />} />
              <Route path="pengajuan" element={<PengajuanPage />} />
              <Route path="settings/users" element={<UserManagement />} />
              <Route path="settings/roles" element={<RoleManagement />} />
              <Route path="settings/thresholds" element={<Threshold />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
