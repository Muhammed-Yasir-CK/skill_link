

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import Company from './pages/Company';
import Login from './pages/Login';
import Signup from './pages/Signup';
// import JobSeekerDashboard from './pages/JobSeekerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import PostJob from './pages/PostJob';
import CompanyPostJob from './pages/CompanyPostJob';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicRoute from './components/PublicRoute';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CompanyManagement from './pages/admin/CompanyManagement';
import AdminSettings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';

//work-user

import WorkLayout from './pages/work_section/WorkLayout';
import WorkDashboard from './pages/work_section/WorkDashboard';
import MyWorks from './pages/work_section/MyWorks';
import PostWork from './pages/work_section/PostWork';
import CompletedWorks from './pages/work_section/CompletedWorks';
import ReceivedApplications from './pages/work_section/ReceivedApplications';
import WorkDetails from './pages/work_section/WorkDetails';
import WorkPaymentSettings from './pages/work_section/WorkPaymentSettings';


// Agreement Imports
import ProviderAgreement from './pages/agreements/ProviderAgreement';
import SeekerAgreement from './pages/agreements/SeekerAgreement';


//user 
import JobSeekerLayout from './pages/user_section/JobSeekerLayout';
import Dashboard from './pages/user_section/Dashboard';
import ProfileOverview from './pages/user_section/ProfileOverview';
import MyApplications from './pages/user_section/MyApplications';
import SavedJobs from './pages/user_section/SavedJobs';
import Notifications from './pages/user_section/Notifications';
import Settings from './pages/user_section/Settings';

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Company logged in → force dashboard as base
  if (
    user?.role === 'company' &&
    ['/', '/login', '/signup'].includes(location.pathname)
  ) {
    return <Navigate to="/company/dashboard" replace />;
  }
  // Seeker logged in → force seeker base
  if (
    user?.role === 'seeker' &&
    ['/', '/login', '/signup'].includes(location.pathname)
  ) {
    return <Navigate to="/seeker" replace />;
  }

  // Admin logged in → force admin dashboard
  if (
    user?.role === 'admin' &&
    ['/', '/login', '/signup'].includes(location.pathname)
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/job/:id" element={<JobDetails />} />
      <Route path="/companies" element={<Company />} />
      {/* <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> */}


      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />



      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute role="company">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/post-job"
        element={
          <ProtectedRoute role="company">
            <CompanyPostJob />
          </ProtectedRoute>
        }
      />



      {/* seeker routing */}
      <Route
        path="/seeker"
        element={
          <ProtectedRoute role="seeker">
            <JobSeekerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        {/* <Route path="dashboard" element={<Navigate to="/seeker" replace />} /> */}

        <Route path="profile" element={<ProfileOverview />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="saved" element={<SavedJobs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />


        {/* <Route path="work/:id" element={<WorkDetails />} /> */}
      </Route>
      <Route path="/post-job" element={<PostJob />} />


      {/* Agreement Management */}
      <Route path="/provider/agreement/:applicationId" element={<ProviderAgreement />} />
      <Route path="/seeker/agreement/:applicationId" element={<SeekerAgreement />} />


      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="companies" element={<CompanyManagement />} />
        <Route path="settings" element={<AdminSettings />} />
    </Route>



      <Route
        path="/work-dashboard"
        element={
          <ProtectedRoute role="seeker">
            <WorkLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkDashboard />} />
        <Route path="my-works" element={<MyWorks />} />
        <Route path="post-work" element={<PostWork />} />
        <Route path="completed" element={<CompletedWorks />} />
        <Route path="applications" element={<ReceivedApplications />} />
        <Route path="work/:id" element={<WorkDetails />} />
        <Route path="payment-settings" element={<WorkPaymentSettings />} />

      </Route>

      <Route
        path="/work/:id"
        element={
          <ProtectedRoute role="seeker">
            <WorkDetails />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Home />} />

    </Routes>
  );
}

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
