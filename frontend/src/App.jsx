import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyCertificate from './pages/VerifyCertificate';

// Student pages
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ExamProctoring from './pages/ExamProctoring';
import CourseDetail from './pages/CourseDetail';
import LessonView from './pages/LessonView';
import CertificatesPage from './pages/CertificatesPage';
import ProfilePage from './pages/ProfilePage';



// Seller pages
import SellerSidebar from './components/SellerSidebar';
import SellerDashboard from './pages/seller/SellerDashboard';
import CreateCourse from './pages/seller/CreateCourse';
import CourseBuilder from './pages/seller/CourseBuilder';

// Recruitment pages
import EmployerDashboard from './pages/recruitment/EmployerDashboard';
import TalentProfile from './pages/recruitment/TalentProfile';

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

/* ── Student App Layout (có Sidebar) ── */
const StudentLayout = ({ children }) => (
    <div className="app-shell">
        <Sidebar />
        <main className="main-content">{children}</main>
    </div>
);

/* ── Seller App Layout (có SellerSidebar) ── */
const SellerLayout = ({ children }) => (
    <div className="app-shell">
        <SellerSidebar />
        <main className="main-content">{children}</main>
    </div>
);

/* ── Employer App Layout (Tạm thời dùng SellerSidebar hoặc Sidebar tương tự) ── */
const EmployerLayout = ({ children }) => (
    <div className="app-shell">
        <Sidebar role="recruiter" />
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

function App() {
    return (
        <AuthProvider>
            <Router>
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
                    <Route path="/profile" element={
                        <PrivateRoute><StudentLayout><ProfilePage /></StudentLayout></PrivateRoute>
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

                    {/* Employer routes */}
                    <Route path="/employer/dashboard" element={
                        <EmployerRoute><EmployerLayout><EmployerDashboard /></EmployerLayout></EmployerRoute>
                    } />
                    <Route path="/employer/talents/:id" element={
                        <EmployerRoute><EmployerLayout><TalentProfile /></EmployerLayout></EmployerRoute>
                    } />
                    <Route path="/employer/messages" element={
                        <EmployerRoute><EmployerLayout><MessagesPage /></EmployerLayout></EmployerRoute>
                    } />

                    {/* 404 fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
