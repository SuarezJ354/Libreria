import Sidebar from "../Admin/components/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="dashboard"  id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '20px'}}>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
