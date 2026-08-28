import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';

import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { AddVehiclePage, EditVehiclePage, VehicleDetailPage, VehiclesPage } from '@/features/vehicles';
import { AddCustomerPage, CustomerDetailPage, CustomersPage, EditCustomerPage } from '@/features/customers';
import { NewRentalPage, RentalDetailPage, RentalsPage } from '@/features/rentals';
import { AddMaintenancePage, MaintenanceDetailPage, MaintenancePage } from '@/features/maintenance';
import { AddExpensePage, ExpenseDetailPage, ExpensesPage } from '@/features/expenses';
import { AnalyticsPage } from '@/features/analytics';
import { ReportsPage } from '@/features/reports';
import { AddTaskPage, TaskDetailPage, TasksPage } from '@/features/tasks';
import NotFound from '@/app/NotFoundPage';

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
      <Route path="/reports" component={ReportsPage} />
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
                    <div className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-5xl">
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
