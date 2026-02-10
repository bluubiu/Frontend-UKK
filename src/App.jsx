import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { NotificationProvider } from './context/NotificationProvider';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ItemsPage from './pages/admin/ItemsPage';
import LoansPage from './pages/admin/LoansPage';
import ReturnsPage from './pages/admin/ReturnsPage';
import FinesVerificationPage from './pages/admin/FinesVerificationPage';
import ReportsPage from './pages/admin/ReportsPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import LoanPrintPage from './pages/admin/LoanPrintPage';
import ReportsPrintPage from './pages/admin/ReportsPrintPage';
import FinesPrintPage from './pages/admin/FinesPrintPage';

// Borrower Pages
import BorrowerItemsPage from './pages/borrower/BorrowerItemsPage';
import MyLoansPage from './pages/borrower/MyLoansPage';
import FineHistoryPage from './pages/borrower/FineHistoryPage';
import WaitingListPage from './pages/borrower/WaitingListPage';

import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/borrower/WishlistPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ShopProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Print Route (No Layout) */}
                <Route
                  path="/admin/loans/:id/print"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'petugas']}>
                      <LoanPrintPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports/print"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'petugas']}>
                      <ReportsPrintPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/fines-verification/print"
                  element={
                    <ProtectedRoute allowedRoles={['petugas']}>
                      <FinesPrintPage />
                    </ProtectedRoute>
                  }
                />

                {/* Dashboard Layout wraps all protected pages */}
                <Route element={<DashboardLayout />}>
                  {/* Admin Routes */}
                  <Route
                    path="admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'petugas']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/categories"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <CategoriesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/items"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ItemsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/loans"
                    element={
                      <ProtectedRoute allowedRoles={['petugas']}>
                        <LoansPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/returns"
                    element={
                      <ProtectedRoute allowedRoles={['petugas']}>
                        <ReturnsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'petugas']}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/activity-logs"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ActivityLogPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/fines-verification"
                    element={
                      <ProtectedRoute allowedRoles={['petugas']}>
                        <FinesVerificationPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* User/Borrower Routes */}
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="items" element={<BorrowerItemsPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="my-loans" element={<MyLoansPage />} />
                  <Route path="fines" element={<FineHistoryPage />} />
                  <Route path="waiting-list" element={<WaitingListPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ShopProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
// Force Rebuild
