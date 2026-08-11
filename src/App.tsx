import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/Auth/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CalculatorPOSPage } from './pages/POS/CalculatorPOSPage';
import { SalesPage } from './pages/Sales/SalesPage';
import { CounterIndexPage } from './pages/Counter/CounterIndexPage';
import { OpenCounterPage } from './pages/Counter/OpenCounterPage';
import { CloseCounterPage } from './pages/Counter/CloseCounterPage';
import { DailyFinanceCheckPage } from './pages/Finance/DailyFinanceCheckPage';
import { VendorIndexPage } from './pages/Vendors/VendorIndexPage';
import { VendorDetail360Page } from './pages/Vendors/VendorDetail360Page';
import { WeeklyPartyPaymentsPage } from './pages/Vendors/WeeklyPartyPaymentsPage';
import { ExpensesListPage } from './pages/Expenses/ExpensesListPage';
import { NewExpensePage } from './pages/Expenses/NewExpensePage';
import { FinanceOverviewPage } from './pages/Finance/FinanceOverviewPage';
import { ProfitLossPage } from './pages/Finance/ProfitLossPage';
import { StaffManagementPage } from './pages/Staff/StaffManagementPage';
import { UserManagementPage } from './pages/Settings/UserManagementPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';

export const App: React.FC = () => {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pos" element={<CalculatorPOSPage />} />
            <Route path="sales" element={<SalesPage />} />

            {/* CASH SHIFT COUNTER & EOD FINANCE CHECK */}
            <Route path="counter" element={<CounterIndexPage />} />
            <Route path="counter/open" element={<OpenCounterPage />} />
            <Route path="counter/close" element={<CloseCounterPage />} />
            <Route path="counter/daily-check" element={<DailyFinanceCheckPage />} />

            {/* PARTIES & PURCHASES */}
            <Route path="vendors" element={<VendorIndexPage />} />
            <Route path="vendors/weekly-payments" element={<WeeklyPartyPaymentsPage />} />
            <Route path="vendors/:vendorId" element={<VendorDetail360Page />} />
            <Route path="purchases" element={<VendorIndexPage />} />

            {/* EXPENSES */}
            <Route path="expenses" element={<ExpensesListPage />} />
            <Route path="expenses/new" element={<NewExpensePage />} />

            {/* FINANCE */}
            <Route path="finance" element={<FinanceOverviewPage />} />
            <Route path="finance/profit-loss" element={<ProfitLossPage />} />

            {/* STAFF & ATTENDANCE & PAYROLL */}
            <Route path="staff" element={<StaffManagementPage />} />

            {/* REPORTS, NOTIFICATIONS & USER MANAGEMENT */}
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<UserManagementPage />} />

            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
};

export default App;
