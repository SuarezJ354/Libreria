import { Outlet } from "react-router-dom";
import SidebarLibrary from "../frontend/components/SidebarLibrary"
import Topbar from "../frontend/components/Topbar";

const PublicLayout = () => {
  return (
    <div className="dashboard"  id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarLibrary/>
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '0px 20px 20px 20px'}}>
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
