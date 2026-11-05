import "./css/style.css";
import "./css/dataTables.bootstrap5.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import AdminLayout from "./Layout/AdminLayout";
import ProtectRouter from "pages/ProtectRouter";
// eslint-disable-next-line
export default function Admin({ children }) {
  return (
    <>
      <ProtectRouter>
        <AdminLayout>{children}</AdminLayout>{" "}
      </ProtectRouter>
    </>
  );
}
