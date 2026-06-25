import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Team from "./pages/Team";
import Portfolio from "./pages/Portfolio";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import BlogAdmin from "./pages/admin/BlogAdmin";
import PortfolioAdmin from "./pages/admin/PortfolioAdmin";
import CaseStudiesAdmin from "./pages/admin/CaseStudiesAdmin";
import CaseStudyGallery from "./pages/admin/CaseStudyGallery";
import TeamAdmin from "./pages/admin/TeamAdmin";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import Inquiries from "./pages/admin/Inquiries";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import MediaLibrary from "./pages/admin/MediaLibrary";
import ActivityLogs from "./pages/admin/ActivityLogs";
import SeoSettings from "./pages/admin/SeoSettings";
import NavigationAdmin from "./pages/admin/NavigationAdmin";
import PageEditor from "./pages/admin/PageEditor";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import ContentEditor from "./pages/admin/ContentEditor";
import HeroSlidesAdmin from "./pages/admin/HeroSlidesAdmin";
import LiveChat from "./pages/admin/LiveChat";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";

export const routers = [
  // ── Public pages (with SOLUTION AI widget via PublicLayout) ──
  {
    element: <PublicLayout />,
    children: [
      { path: "/", name: "home", element: <Index /> },
      { path: "/about", name: "about", element: <About /> },
      { path: "/team", name: "team", element: <Team /> },
      { path: "/portfolio", name: "portfolio", element: <Portfolio /> },
      { path: "/case-studies", name: "caseStudies", element: <CaseStudies /> },
      { path: "/case-studies/:slug", name: "caseStudyDetail", element: <CaseStudyDetail /> },
      { path: "/blog", name: "blog", element: <Blog /> },
      { path: "/blog/:slug", name: "blogPost", element: <BlogPost /> },
      { path: "/contact", name: "contact", element: <Contact /> },
      { path: "/services", name: "services", element: <Services /> },
    ],
  },

  // ── Admin auth ────────────────────────────────────────────
  { path: "/admin/login", name: "adminLogin", element: <AdminLogin /> },

  // ── Admin protected ───────────────────────────────────────
  { path: "/admin", name: "admin", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/admin/dashboard", name: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },

  // Content management
  { path: "/admin/blog", name: "adminBlog", element: <ProtectedRoute><BlogAdmin /></ProtectedRoute> },
  { path: "/admin/portfolio", name: "adminPortfolio", element: <ProtectedRoute><PortfolioAdmin /></ProtectedRoute> },
  { path: "/admin/case-studies", name: "adminCaseStudies", element: <ProtectedRoute><CaseStudiesAdmin /></ProtectedRoute> },
  { path: "/admin/case-study-gallery", name: "adminCaseStudyGallery", element: <ProtectedRoute><CaseStudyGallery /></ProtectedRoute> },
  { path: "/admin/team", name: "adminTeam", element: <ProtectedRoute><TeamAdmin /></ProtectedRoute> },
  { path: "/admin/testimonials", name: "adminTestimonials", element: <ProtectedRoute><TestimonialsAdmin /></ProtectedRoute> },
  { path: "/admin/inquiries", name: "adminInquiries", element: <ProtectedRoute><Inquiries /></ProtectedRoute> },

  // Live Chat
  { path: "/admin/live-chat", name: "adminLiveChat", element: <ProtectedRoute><LiveChat /></ProtectedRoute> },

  // Site management
  { path: "/admin/content", name: "adminContent", element: <ProtectedRoute><ContentEditor /></ProtectedRoute> },
  { path: "/admin/services", name: "adminServices", element: <ProtectedRoute><ServicesAdmin /></ProtectedRoute> },
  { path: "/admin/hero-slides", name: "adminHeroSlides", element: <ProtectedRoute><HeroSlidesAdmin /></ProtectedRoute> },
  { path: "/admin/pages", name: "adminPages", element: <ProtectedRoute><PageEditor /></ProtectedRoute> },
  { path: "/admin/media", name: "adminMedia", element: <ProtectedRoute><MediaLibrary /></ProtectedRoute> },
  { path: "/admin/navigation", name: "adminNavigation", element: <ProtectedRoute><NavigationAdmin /></ProtectedRoute> },
  { path: "/admin/seo", name: "adminSeo", element: <ProtectedRoute><SeoSettings /></ProtectedRoute> },

  // System
  { path: "/admin/activity-logs", name: "adminActivityLogs", element: <ProtectedRoute><ActivityLogs /></ProtectedRoute> },
  { path: "/admin/users", name: "adminUsers", element: <ProtectedRoute><Users /></ProtectedRoute> },
  { path: "/admin/settings", name: "adminSettings", element: <ProtectedRoute><Settings /></ProtectedRoute> },

  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  { path: "*", name: "404", element: <NotFound /> },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
