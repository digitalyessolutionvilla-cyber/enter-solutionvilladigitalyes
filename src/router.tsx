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
import NewsletterAdmin from "./pages/admin/NewsletterAdmin";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";
import {
  CONTENT_ROLES,
  SUPPORT_ROLES,
  FULL_ADMIN_ROLES,
  SUPER_ADMIN_ONLY,
} from "./lib/adminPermissions";

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

  // Content management (Content Editor + Admins)
  { path: "/admin/blog", name: "adminBlog", element: <ProtectedRoute roles={CONTENT_ROLES}><BlogAdmin /></ProtectedRoute> },
  { path: "/admin/portfolio", name: "adminPortfolio", element: <ProtectedRoute roles={CONTENT_ROLES}><PortfolioAdmin /></ProtectedRoute> },
  { path: "/admin/case-studies", name: "adminCaseStudies", element: <ProtectedRoute roles={CONTENT_ROLES}><CaseStudiesAdmin /></ProtectedRoute> },
  { path: "/admin/case-study-gallery", name: "adminCaseStudyGallery", element: <ProtectedRoute roles={CONTENT_ROLES}><CaseStudyGallery /></ProtectedRoute> },
  { path: "/admin/team", name: "adminTeam", element: <ProtectedRoute roles={CONTENT_ROLES}><TeamAdmin /></ProtectedRoute> },
  { path: "/admin/testimonials", name: "adminTestimonials", element: <ProtectedRoute roles={CONTENT_ROLES}><TestimonialsAdmin /></ProtectedRoute> },
  { path: "/admin/inquiries", name: "adminInquiries", element: <ProtectedRoute roles={SUPPORT_ROLES}><Inquiries /></ProtectedRoute> },
  { path: "/admin/newsletter", name: "adminNewsletter", element: <ProtectedRoute roles={SUPPORT_ROLES}><NewsletterAdmin /></ProtectedRoute> },

  // Live Chat (Support + Admins)
  { path: "/admin/live-chat", name: "adminLiveChat", element: <ProtectedRoute roles={SUPPORT_ROLES}><LiveChat /></ProtectedRoute> },

  // Site management
  { path: "/admin/content", name: "adminContent", element: <ProtectedRoute roles={CONTENT_ROLES}><ContentEditor /></ProtectedRoute> },
  { path: "/admin/services", name: "adminServices", element: <ProtectedRoute roles={CONTENT_ROLES}><ServicesAdmin /></ProtectedRoute> },
  { path: "/admin/pages", name: "adminPages", element: <ProtectedRoute roles={CONTENT_ROLES}><PageEditor /></ProtectedRoute> },
  { path: "/admin/media", name: "adminMedia", element: <ProtectedRoute roles={CONTENT_ROLES}><MediaLibrary /></ProtectedRoute> },
  { path: "/admin/hero-slides", name: "adminHeroSlides", element: <ProtectedRoute roles={FULL_ADMIN_ROLES}><HeroSlidesAdmin /></ProtectedRoute> },
  { path: "/admin/navigation", name: "adminNavigation", element: <ProtectedRoute roles={FULL_ADMIN_ROLES}><NavigationAdmin /></ProtectedRoute> },
  { path: "/admin/seo", name: "adminSeo", element: <ProtectedRoute roles={FULL_ADMIN_ROLES}><SeoSettings /></ProtectedRoute> },

  // System
  { path: "/admin/activity-logs", name: "adminActivityLogs", element: <ProtectedRoute roles={FULL_ADMIN_ROLES}><ActivityLogs /></ProtectedRoute> },
  { path: "/admin/users", name: "adminUsers", element: <ProtectedRoute roles={SUPER_ADMIN_ONLY}><Users /></ProtectedRoute> },
  { path: "/admin/settings", name: "adminSettings", element: <ProtectedRoute roles={FULL_ADMIN_ROLES}><Settings /></ProtectedRoute> },

  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  { path: "*", name: "404", element: <NotFound /> },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
