import { Box } from "@chakra-ui/react"
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Footer } from "./components/Footer"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { About } from "./pages/About"
import { StudentDashboard } from "./pages/StudentDashboard"
import { EditProfile } from "./pages/student/profile/EditProfile"
import { PreviewProfile } from "./pages/student/profile/PreviewProfile"
import { PlacementFeed } from "./pages/student/profile/PlacementFeed"
import { StudentJobOffers } from "./pages/student/profile/StudentJobOffers"
import { StudentEvents } from "./pages/student/profile/StudentEvents"
import { StudentPlacementPolicy } from "./pages/student/profile/StudentPlacementPolicy"
import { StudentDriveDetails } from "./pages/student/profile/StudentDriveDetails"
import { AuthProvider } from "./context/AuthContext"
import PlacementDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ChangePassword from './pages/common/ChangePassword';
import ForgotPassword from './pages/common/ForgotPassword';
import PlacementRegister from './pages/admin/Register';
import Students from './pages/admin/Students';
import JobOffers from './pages/admin/JobOffers';
import Events from './pages/admin/Events';
import DriveRegistrations from './pages/admin/DriveRegistrations';
import Reports from './pages/admin/Reports';
import Companies from './pages/admin/Companies';
import CompanyDetails from './pages/admin/CompanyDetails';
import StudentDetails from './pages/common/StudentDetails';
import AlumniList from './pages/admin/AlumniList';
import AlumniDirectory from './pages/alumni/AlumniDirectory';
import AlumniDetails from './pages/common/AlumniDetails';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniEvents from './pages/alumni/AlumniEvents';
import AlumniFavStudents from './pages/alumni/AlumniFavStudents';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyDrives from './pages/company/CompanyDrives';
import CompanyDriveDetails from './pages/company/CompanyDriveDetails';
import CompanyFavStudents from './pages/company/CompanyFavStudents';
import CompanyFavProjects from './pages/company/CompanyFavProjects';
import ProjectGallery from './pages/common/ProjectGallery';
import ReferralForm from './pages/alumni/ReferralForm';
import CalendarOfEvents from './pages/admin/CalendarOfEvents';
import ManagementDashboard from './pages/management/ManagementDashboard';
import ManagementLayout from './components/ManagementLayout';
import DeanDashboard from './pages/dean/DeanDashboard';
import DeanCompanies from './pages/dean/DeanCompanies';
import DeanLayout from './components/DeanLayout';
import ParentLayout from './components/ParentLayout';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentEvents from './pages/parent/ParentEvents';
import ParentHRContact from './pages/parent/ParentHRContact';
import PlacementProtectedRoute from './components/PlacementProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import RouteError from './components/RouteError';

const MainLayout = () => (
  <Box minH="100vh" display="flex" flexDirection="column">
    <Navbar />
    <Box flex="1">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Box>
    <Footer />
  </Box>
)

const StudentLayoutWrapper = () => (
  <Box minH="100vh" display="flex" flexDirection="column">
    <Box flex="1">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Box>
    {/* Optional Footer for students? Assuming yes or no, safe to leave out if not requested */}
  </Box>
)

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/placement/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Student Routes without Top Navbar */}
      <Route element={<StudentLayoutWrapper />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<EditProfile />} />
        <Route path="/student/profile/:section" element={<EditProfile />} />
        <Route path="/student/profile/preview" element={<PreviewProfile />} />
        <Route path="/student/placements/feed" element={<PlacementFeed />} />
        <Route path="/student/placements/drive/:id" element={<StudentDriveDetails />} />
        <Route path="/student/placements/offers" element={<StudentJobOffers />} />
        <Route path="/student/placements/events" element={<StudentEvents />} />
        <Route path="/student/placements/policy" element={<StudentPlacementPolicy />} />
        {/* Redirect old route for backward compatibility */}
        <Route path="/student-profile" element={<EditProfile />} />
      </Route>

      {/* Placement & Alumni Routes with Error Handling */}
      <Route errorElement={<RouteError />}>
        {/* Placement Officer Routes */}
        <Route
          path="/placement/dashboard"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <PlacementDashboard />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/gallery"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <ProjectGallery />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/students"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <Students />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/students/:usn"
          element={
            <PlacementProtectedRoute requiredRole={['admin', 'alumni']}>
              <StudentDetails />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/job-offers"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <JobOffers />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/events"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <Events />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/events"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <Events />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/events/:driveId/registrations"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <DriveRegistrations />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/reports"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <Reports />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/companies"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <Companies />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/company/:id"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <CompanyDetails />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/alumni"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <AlumniList />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/alumni/:usn"
          element={
            <PlacementProtectedRoute requiredRole={['admin', 'alumni']}>
              <AlumniDetails />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/users"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <UserManagement />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/calendar"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <CalendarOfEvents />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/register"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <PlacementRegister />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/change-password/:userId"
          element={
            <PlacementProtectedRoute requiredRole="admin">
              <ChangePassword />
            </PlacementProtectedRoute>
          }
        />

        {/* Alumni Routes */}
        <Route
          path="/placement/alumni-dashboard"
          element={
            <PlacementProtectedRoute requiredRole="alumni">
              <AlumniDashboard />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/alumni-events"
          element={
            <PlacementProtectedRoute requiredRole="alumni">
              <AlumniEvents />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/alumni-fav-students"
          element={
            <PlacementProtectedRoute requiredRole="alumni">
              <AlumniFavStudents />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/alumni-directory"
          element={
            <PlacementProtectedRoute requiredRole="alumni">
              <AlumniDirectory />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/alumni-projects"
          element={
            <PlacementProtectedRoute requiredRole="alumni">
              <ProjectGallery />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/placement/alumni-referral"
          element={
            <PlacementProtectedRoute requiredRole="alumni">
              <ReferralForm />
            </PlacementProtectedRoute>
          }
        />

        {/* Dean Routes */}
        <Route
          path="/dean/dashboard"
          element={
            <PlacementProtectedRoute requiredRole="dean">
              <DeanLayout>
                <DeanDashboard />
              </DeanLayout>
            </PlacementProtectedRoute>
          }
        />
        <Route
            path="/dean/projects"
            element={
                <PlacementProtectedRoute requiredRole="dean">
                    <DeanLayout>
                        <ProjectGallery />
                    </DeanLayout>
                </PlacementProtectedRoute>
            }
        />
        <Route
            path="/dean/companies"
            element={
                <PlacementProtectedRoute requiredRole="dean">
                    <DeanLayout>
                        <DeanCompanies />
                    </DeanLayout>
                </PlacementProtectedRoute>
            }
        />
        <Route
          path="/company/dashboard"
          element={
            <PlacementProtectedRoute requiredRole="company">
              <CompanyDashboard />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/company/drives"
          element={
            <PlacementProtectedRoute requiredRole="company">
              <CompanyDrives />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/company/drive/:id"
          element={
            <PlacementProtectedRoute requiredRole="company">
              <CompanyDriveDetails />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/company/student/:usn"
          element={
            <PlacementProtectedRoute requiredRole="company">
              <StudentDetails />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/company/favorites/students"
          element={
            <PlacementProtectedRoute requiredRole="company">
              <CompanyFavStudents />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/company/favorites/projects"
          element={
            <PlacementProtectedRoute requiredRole="company">
              <CompanyFavProjects />
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/company/projects"
          element={
            <PlacementProtectedRoute requiredRole="company">
              <ProjectGallery />
            </PlacementProtectedRoute>
          }
        />

        {/* Parent Routes */}
        <Route
          path="/parent/dashboard"
          element={
            <PlacementProtectedRoute requiredRole="parent">
              <ParentLayout>
                <ParentDashboard />
              </ParentLayout>
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/parent/projects"
          element={
            <PlacementProtectedRoute requiredRole="parent">
              <ParentLayout>
                <ProjectGallery />
              </ParentLayout>
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/parent/events"
          element={
            <PlacementProtectedRoute requiredRole="parent">
              <ParentLayout>
                <ParentEvents />
              </ParentLayout>
            </PlacementProtectedRoute>
          }
        />
        <Route
          path="/parent/contact"
          element={
            <PlacementProtectedRoute requiredRole="parent">
              <ParentLayout>
                <ParentHRContact />
              </ParentLayout>
            </PlacementProtectedRoute>
          }
        />

        {/* Management Routes */}
        <Route
          path="/management/dashboard"
          element={
            <PlacementProtectedRoute requiredRole="management">
              <ManagementLayout>
                <ManagementDashboard />
              </ManagementLayout>
            </PlacementProtectedRoute>
          }
        />
      </Route>
    </>
  )
)

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
