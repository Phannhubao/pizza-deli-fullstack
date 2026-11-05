import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <AdminSidebar />
      <div className="admin-page-content-wrapper">
        <Outlet />
      </div>
    </>
  );
}
