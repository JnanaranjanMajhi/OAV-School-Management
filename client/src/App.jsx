import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';

// Loading fallback
const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner"></div>
  </div>
);

// Public pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'));
const TeachersPage = lazy(() => import('./pages/public/TeachersPage'));
const DownloadsPage = lazy(() => import('./pages/public/DownloadsPage'));
const OnlineClassesPage = lazy(() => import('./pages/public/OnlineClassesPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const ResultSearchPage = lazy(() => import('./pages/public/ResultSearchPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSchoolInfo = lazy(() => import('./pages/admin/AdminSchoolInfo'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminNotices = lazy(() => import('./pages/admin/AdminNotices'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminDownloads = lazy(() => import('./pages/admin/AdminDownloads'));
const AdminResults = lazy(() => import('./pages/admin/AdminResults'));
const AdminTeachers = lazy(() => import('./pages/admin/AdminTeachers'));
const AdminAdmins = lazy(() => import('./pages/admin/AdminAdmins'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminOnlineClasses = lazy(() => import('./pages/admin/AdminOnlineClasses'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'));

// Teacher pages
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherEvents = lazy(() => import('./pages/teacher/TeacherEvents'));
const TeacherResults = lazy(() => import('./pages/teacher/TeacherResults'));
const TeacherNotices = lazy(() => import('./pages/teacher/TeacherNotices'));
const TeacherOnlineClasses = lazy(() => import('./pages/teacher/TeacherOnlineClasses'));
const TeacherStudents = lazy(() => import('./pages/teacher/TeacherStudents'));
const TeacherAttendance = lazy(() => import('./pages/teacher/TeacherAttendance'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentResults = lazy(() => import('./pages/student/StudentResults'));
const StudentEvents = lazy(() => import('./pages/student/StudentEvents'));
const StudentAnnouncements = lazy(() => import('./pages/student/StudentAnnouncements'));
const StudentNotices = lazy(() => import('./pages/student/StudentNotices'));
const StudentDownloads = lazy(() => import('./pages/student/StudentDownloads'));
const StudentOnlineClasses = lazy(() => import('./pages/student/StudentOnlineClasses'));
const StudentAttendance = lazy(() => import('./pages/student/StudentAttendance'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));

// Shared
const GrievanceChat = lazy(() => import('./pages/shared/GrievanceChat'));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <ConfirmProvider>
            <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' } }} />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/online-classes" element={<OnlineClassesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/results" element={<ResultSearchPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Admin */}
                <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminRoutes /></ProtectedRoute>} />

                {/* Teacher */}
                <Route path="/teacher/*" element={<ProtectedRoute roles={['admin', 'teacher']}><TeacherRoutes /></ProtectedRoute>} />

                {/* Student */}
                <Route path="/student/*" element={<ProtectedRoute roles={['student']}><StudentRoutes /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ConfirmProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="school-info" element={<AdminSchoolInfo />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="downloads" element={<AdminDownloads />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="online-classes" element={<AdminOnlineClasses />} />
        <Route path="contact" element={<AdminContact />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="grievances" element={<GrievanceChat />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function TeacherRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="events" element={<TeacherEvents />} />
        <Route path="results" element={<TeacherResults />} />
        <Route path="notices" element={<TeacherNotices />} />
        <Route path="online-classes" element={<TeacherOnlineClasses />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="grievances" element={<GrievanceChat />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function StudentRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="events" element={<StudentEvents />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="notices" element={<StudentNotices />} />
        <Route path="downloads" element={<StudentDownloads />} />
        <Route path="online-classes" element={<StudentOnlineClasses />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="grievances" element={<GrievanceChat />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
