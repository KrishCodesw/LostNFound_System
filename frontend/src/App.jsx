import { Routes, Route, Navigate } from "react-router-dom";

import StudentLayout from "@/components/layout/StudentLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import FeedPage from "@/pages/student/Feed";
import ReportItemPage from "@/pages/student/ReportItem";
import ItemDetailPage from "@/pages/student/ItemDetail";
import MyClaimsPage from "@/pages/student/MyClaims";
import ProfilePage from "@/pages/student/Profile";

import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";

import AdminDashboardPage from "@/pages/admin/Dashboard";
import AdminClaimsPage from "@/pages/admin/Claims";
import AdminItemsPage from "@/pages/admin/Items";
import AdminUsersPage from "@/pages/admin/Users";

export default function App() {
  return (
    <Routes>
      {/* Auth — no shell, full-bleed mobile-first screens */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student — mobile-first, bottom-tab shell */}
      <Route element={<StudentLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/report" element={<ReportItemPage />} />
        <Route path="/claims" element={<MyClaimsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin — desktop-optimized, brutalist console */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="claims" element={<AdminClaimsPage />} />
        <Route path="items" element={<AdminItemsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
