import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyCertificate from './pages/VerifyCertificate';

// Student pages
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ExamProctoring from './pages/ExamProctoring';
import CourseDetail from './pages/CourseDetail';
import LessonView from './pages/LessonView';
import CertificatesPage from './pages/CertificatesPage';
import ProfilePage from './pages/ProfilePage';

// Seller pages
import SellerDashboard from './pages/seller/SellerDashboard';
import CreateCourse from './pages/seller/CreateCourse';
import CourseBuilder from './pages/seller/CourseBuilder';
import SellerRevenue from './pages/seller/SellerRevenue';
import SellerStudents from './pages/seller/SellerStudents';
import SellerReviews from './pages/seller/SellerReviews';
import SellerSettings from './pages/seller/SellerSettings';

// Recruitment pages
import EmployerDashboard from './pages/recruitment/EmployerDashboard';
import TalentProfile from './pages/recruitment/TalentProfile';
import TalentSearch from './pages/recruitment/TalentSearch';
import CourseCatalog from './pages/recruitment/CourseCatalog';
import HiringManagement from './pages/recruitment/HiringManagement';

// Shared pages
import MessagesPage from './pages/MessagesPage';

/* ── Guard: chỉ cho phép user đã đăng nhập ── */
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>⏳ Đang tải...</div>;
    return user ? children : <Navigate to="/login" replace />;
};

/* ── Guard: chỉ cho phép Giảng viên/Người bán ── */
const SellerRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>⏳ Đang tải...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.vai_tro !== 'GiangVien') return <Navigate to="/dashboard" replace />;
    return children;
};

/* ── Guard: chỉ cho phép Nhà tuyển dụng ── */
const EmployerRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>⏳ Đang tải...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.vai_tro !== 'NhaTuyenDung') return <Navigate to="/dashboard" replace />;
    return children;
};

/* ── Student App Layout (có Navbar mới) ── */
const StudentLayout = ({ children }) => (
    <div className="app-shell">
        <Navbar />
        <main className="main-content">{children}</main>
    </div>
);

/* ── Seller App Layout (có Navbar mới) ── */
const SellerLayout = ({ children }) => (
    <div className="app-shell">
        <Navbar />
        <main className="main-content">{children}</main>
    </div>
);

/* ── Employer App Layout (có Navbar mới) ── */
const EmployerLayout = ({ children }) => (
    <div className="app-shell">
        <Navbar />
        <main className="main-content">{children}</main>
    </div>
);

/* ── Auto-redirect sau đăng nhập theo vai trò ── */
const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Landing />;
    if (user.vai_tro === 'GiangVien') return <Navigate to="/seller/dashboard" replace />;
    if (user.vai_tro === 'NhaTuyenDung') return <Navigate to="/employer/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
};

/* ── Auth profile wrapper for layouts ── */
const AuthProfileLayout = () => {
    const { user } = useAuth();
    if (user?.vai_tro === 'GiangVien') return <SellerLayout><ProfilePage /></SellerLayout>;
    if (user?.vai_tro === 'NhaTuyenDung') return <EmployerLayout><ProfilePage /></EmployerLayout>;
    return <StudentLayout><ProfilePage /></StudentLayout>;
};

import { ChatProvider } from './context/ChatContext';

function App() {
    return (
        <AuthProvider>
            <ChatProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                    {/* Landing */}
                    <Route path="/" element={<HomeRedirect />} />

                    {/* Public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify/:uuid" element={<VerifyCertificate />} />

                    {/* Student routes */}
                    <Route path="/dashboard" element={
                        <PrivateRoute><StudentLayout><Dashboard /></StudentLayout></PrivateRoute>
                    } />
                    <Route path="/courses/:id" element={
                        <PrivateRoute><StudentLayout><CourseDetail /></StudentLayout></PrivateRoute>
                    } />
                    <Route path="/courses/:id/learn" element={
                        <PrivateRoute><StudentLayout><LessonView /></StudentLayout></PrivateRoute>
                    } />
                    <Route path="/certificates" element={
                        <PrivateRoute><StudentLayout><CertificatesPage /></StudentLayout></PrivateRoute>
                    } />
                    {/* Layout-agnostic Profile Route */}
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <AuthProfileLayout />
                        </PrivateRoute>
                    } />


                    <Route path="/courses" element={
                        <PrivateRoute><StudentLayout><Dashboard /></StudentLayout></PrivateRoute>
                    } />
                    <Route path="/exam" element={
                        <PrivateRoute><StudentLayout><ExamProctoring /></StudentLayout></PrivateRoute>
                    } />
                    <Route path="/messages" element={
                        <PrivateRoute><StudentLayout><MessagesPage /></StudentLayout></PrivateRoute>
                    } />

                    {/* Seller routes */}
                    <Route path="/seller/dashboard" element={
                        <SellerRoute><SellerLayout><SellerDashboard /></SellerLayout></SellerRoute>
                    } />
                    <Route path="/seller/courses" element={
                        <SellerRoute><SellerLayout><SellerDashboard /></SellerLayout></SellerRoute>
                    } />
                    <Route path="/seller/courses/new" element={
                        <SellerRoute><SellerLayout><CreateCourse /></SellerLayout></SellerRoute>
                    } />
                    <Route path="/seller/courses/:id/builder" element={
                        <SellerRoute><SellerLayout><CourseBuilder /></SellerLayout></SellerRoute>
                    } />
                    <Route path="/seller/revenue" element={
                        <SellerRoute><SellerLayout><SellerRevenue /></SellerLayout></SellerRoute>
                    } />
                    <Route path="/seller/students" element={
                        <SellerRoute><SellerLayout><SellerStudents /></SellerLayout></SellerRoute>
                    } />
                    <Route path="/seller/reviews" element={
                        <SellerRoute><SellerLayout><SellerReviews /></SellerLayout></SellerRoute>
                    } />
                    <Route path="/seller/settings" element={
                        <SellerRoute><SellerLayout><SellerSettings /></SellerLayout></SellerRoute>
                    } />

                    {/* Employer routes */}
                    <Route path="/employer/dashboard" element={
                        <EmployerRoute><EmployerLayout><EmployerDashboard /></EmployerLayout></EmployerRoute>
                    } />
                    <Route path="/employer/courses" element={
                        <EmployerRoute><EmployerLayout><CourseCatalog /></EmployerLayout></EmployerRoute>
                    } />
                    <Route path="/employer/talents" element={
                        <EmployerRoute><EmployerLayout><TalentSearch /></EmployerLayout></EmployerRoute>
                    } />
                    <Route path="/employer/talents/:id" element={
                        <EmployerRoute><EmployerLayout><TalentProfile /></EmployerLayout></EmployerRoute>
                    } />
                    <Route path="/employer/jobs" element={
                        <EmployerRoute><EmployerLayout><HiringManagement /></EmployerLayout></EmployerRoute>
                    } />
                    <Route path="/employer/messages" element={
                        <EmployerRoute><EmployerLayout><MessagesPage /></EmployerLayout></EmployerRoute>
                    } />

                    {/* 404 fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ChatProvider>
    </AuthProvider>
    );
}

export default App;
