import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Projects from './pages/Projects';
import Categories from './pages/Categories/All';
import AddCategory from './pages/Categories/Add';
import Meals from './pages/Meals/All';
import AddMeal from './pages/Meals/Add';
import Users from './pages/Users/All';

import useAuth from './hooks/useAuth';
// ----------------------------------------------------------------------
function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  const { pathname } = useLocation();

  return isAuthed ? children : <Navigate to="/login" replace state={{ path: pathname }} />;
}

function AlreadyAuth({ children }) {
  const { isAuthed } = useAuth();
  const { state } = useLocation();

  return isAuthed ? <Navigate to={state?.path || '/dashboard/projects'} replace /> : children;
}

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: (
        <RequireAuth>
          <DashboardLayout />
        </RequireAuth>
      ),
      children: [
        { path: 'users', element: <Users /> },
        { path: 'categories', element: <Categories /> },
        { path: 'categories/add', element: <AddCategory /> },
        { path: 'categories/edit/:id', element: <AddCategory /> },

        { path: 'meals', element: <Meals /> },
        { path: 'meals/add', element: <AddMeal /> },
        { path: 'meals/edit/:id', element: <AddMeal /> },

        { path: 'projects', element: <Projects /> },
      ],
    },
    {
      path: '/',
      element: (
        <AlreadyAuth>
          <LogoOnlyLayout />
        </AlreadyAuth>
      ),
      children: [
        { path: '/', element: <Navigate to="/dashboard/projects" /> },
        { path: 'login', element: <Login /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
