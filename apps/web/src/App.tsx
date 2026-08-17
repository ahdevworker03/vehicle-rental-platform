import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import VehiclesPage from '@/pages/VehiclesPage';
import AddVehiclePage from '@/pages/AddVehiclePage';
import VehicleDetailPage from '@/pages/VehicleDetailPage';
import EditVehiclePage from '@/pages/EditVehiclePage';
import CustomersPage from '@/pages/CustomersPage';
import AddCustomerPage from '@/pages/AddCustomerPage';
import EditCustomerPage from '@/pages/EditCustomerPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import RentalsPage from '@/pages/RentalsPage';
import NewRentalPage from '@/pages/NewRentalPage';
import RentalDetailPage from '@/pages/RentalDetailPage';
import MaintenancePage from '@/pages/MaintenancePage';
import AddMaintenancePage from '@/pages/AddMaintenancePage';
import MaintenanceDetailPage from '@/pages/MaintenanceDetailPage';
import ExpensesPage from '@/pages/ExpensesPage';
import AddExpensePage from '@/pages/AddExpensePage';
import ExpenseDetailPage from '@/pages/ExpenseDetailPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import TasksPage from '@/pages/TasksPage';
import AddTaskPage from '@/pages/AddTaskPage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/vehicles" component={VehiclesPage} />
      <Route path="/vehicles/add" component={AddVehiclePage} />
      <Route path="/vehicles/:id/edit" component={EditVehiclePage} />
      <Route path="/vehicles/:id" component={VehicleDetailPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/customers/add" component={AddCustomerPage} />
      <Route path="/customers/:id/edit" component={EditCustomerPage} />
      <Route path="/customers/:id" component={CustomerDetailPage} />
      <Route path="/rentals" component={RentalsPage} />
      <Route path="/rentals/:id" component={RentalDetailPage} />
      <Route path="/maintenance" component={MaintenancePage} />
      <Route path="/maintenance/:id" component={MaintenanceDetailPage} />
      <Route path="/expenses" component={ExpensesPage} />
      <Route path="/expenses/:id" component={ExpenseDetailPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/tasks/:id" component={TaskDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedShell() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Router />
      </AppShell>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Switch>
              {/* Public routes */}
              <Route path="/login" component={LoginPage} />

              {/* Full-screen flows render outside AppShell (no bottom navigation) */}
              <Route path="/rentals/new">
                <ProtectedRoute>
                  <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
                    <div className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-3xl">
                      <NewRentalPage />
                    </div>
                  </div>
                </ProtectedRoute>
              </Route>
              <Route path="/maintenance/add">
                <ProtectedRoute>
                  <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
                    <div className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-3xl">
                      <AddMaintenancePage />
                    </div>
                  </div>
                </ProtectedRoute>
              </Route>
              <Route path="/expenses/add">
                <ProtectedRoute>
                  <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
                    <div className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-3xl">
                      <AddExpensePage />
                    </div>
                  </div>
                </ProtectedRoute>
              </Route>
              <Route path="/tasks/add">
                <ProtectedRoute>
                  <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
                    <div className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-3xl">
                      <AddTaskPage />
                    </div>
                  </div>
                </ProtectedRoute>
              </Route>

              <Route>
                <ProtectedShell />
              </Route>
            </Switch>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
