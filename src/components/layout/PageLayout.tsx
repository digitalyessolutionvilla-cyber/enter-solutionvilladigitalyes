import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#060F1E] flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
