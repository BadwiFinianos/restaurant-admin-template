import { QueryClientProvider } from 'react-query';

// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import { queryClient } from './utils/queryClient';
import AxiosInterceptor from './utils/AxiosInterceptor';
import './theme/theme.css';
import { AuthProvider } from './hooks/useAuth';
// ----------------------------------------------------------------------

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AxiosInterceptor>
        <AuthProvider>
          <ThemeProvider>
            <ScrollToTop />
            <BaseOptionChartStyle />
            <Router />
          </ThemeProvider>
        </AuthProvider>
      </AxiosInterceptor>
    </QueryClientProvider>
  );
}
