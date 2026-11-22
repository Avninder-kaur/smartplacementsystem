import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { JobApplicationProvider } from "@/context/JobApplicationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminJobListings from "./pages/admin/AdminJobListings";
import AdminReports from "./pages/admin/AdminReports";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageStudents from "./pages/admin/ManageStudents";
import Companies from "./pages/Companies";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import ManageJobs from "./pages/company/ManageJobs";
import PostJob from "./pages/company/PostJob";
import ViewApplicants from "./pages/company/ViewApplicants";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import AppliedJobs from "./pages/student/AppliedJobs";
import AvailableJobs from "./pages/student/AvailableJobs";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentProfile from "./pages/student/StudentProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <JobApplicationProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/jobs" element={<ProtectedRoute allowedRoles={["student"]}><AvailableJobs /></ProtectedRoute>} />
              <Route path="/student/applied" element={<ProtectedRoute allowedRoles={["student"]}><AppliedJobs /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
              <Route path="/student/status" element={<ProtectedRoute allowedRoles={["student"]}><AppliedJobs /></ProtectedRoute>} />
              <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={["student"]}><StudentNotifications /></ProtectedRoute>} />

              {/* Company / Recruiter Routes */}
              <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={["recruiter", "company", "admin"]}><CompanyDashboard /></ProtectedRoute>} />
              <Route path="/company/post-job" element={<ProtectedRoute allowedRoles={["recruiter", "company", "admin"]}><PostJob /></ProtectedRoute>} />
              <Route path="/company/manage-jobs" element={<ProtectedRoute allowedRoles={["recruiter", "company", "admin"]}><ManageJobs /></ProtectedRoute>} />
              <Route path="/company/applicants" element={<ProtectedRoute allowedRoles={["recruiter", "company", "admin"]}><ViewApplicants /></ProtectedRoute>} />
              <Route path="/company/profile" element={<ProtectedRoute allowedRoles={["recruiter", "company", "admin"]}><CompanyProfile /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><ManageStudents /></ProtectedRoute>} />
              <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={["admin"]}><ManageCompanies /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminJobListings /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />

              {/* Recruiter (alias) */}
              <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={["recruiter", "company", "admin"]}><CompanyDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </JobApplicationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
