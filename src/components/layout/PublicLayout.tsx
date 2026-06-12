import { Outlet } from "react-router-dom";
import SolutionWidget from "@/components/chat/SolutionWidget";

export default function PublicLayout() {
  return (
    <>
      <Outlet />
      <SolutionWidget />
    </>
  );
}
