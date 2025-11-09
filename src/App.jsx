import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Header, 
  Footer, 
  ToastContainer, 
  BottomNavigation, 
  ScrollToTop,
  BackendStatus,
  PageLoader
} from '@components';
import { allRoutes } from './routes';
import './App.css';

// Valid paths for showing header/footer (excluding 404 and admin)
const VALID_PATHS = [
  '/', '/products', '/cart', '/checkout', '/order-success', '/payment-success',
  '/blog', '/contact', '/orders', '/stores', '/favorites', '/account', 
  '/profile', '/profile/edit', '/profile/change-password', '/login', 
  '/search', '/sale', '/new-arrivals', '/brands', '/about',
  '/my-orders', '/profile/orders'
];

function AppContent() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Check if current path is a valid path (not 404) - memoized
  const is404Page = useMemo(() => {
    return !VALID_PATHS.some(path => 
      location.pathname === path || 
      location.pathname.startsWith('/product/') ||
      location.pathname.startsWith('/my-orders/')
    );
  }, [location.pathname]);
  
  // Hide header/footer for admin pages - memoized
  const isAdminPage = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      setTransitionStage('fadeOut');
    }
  }, [location.pathname, displayLocation.pathname]);

  const onAnimationEnd = useCallback(() => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
      window.scrollTo(0, 0); // Scroll to top on page change
      // Reset transition state after a short delay
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }
  }, [transitionStage, location]);

  return (
    <div className="bg-white text-gray-800">
      <PageLoader 
        duration={1500} 
        onComplete={() => setIsPageLoading(false)} 
      />
      {!isPageLoading && (
        <>
          {!is404Page && !isAdminPage && <Header />}
          
          {/* Page Transition Overlay */}
          {isTransitioning && (
            <>
              <div className="page-transition-overlay"></div>
              <div className="page-transition-loader">
                <div className="page-transition-loader-spinner"></div>
              </div>
            </>
          )}
          
          <div 
            className={`page-transition ${transitionStage}`}
            onAnimationEnd={onAnimationEnd}
          >
            <Routes location={displayLocation}>
              {allRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </div>
          
          {!is404Page && !isAdminPage && <Footer />}
          {!is404Page && !isAdminPage && <BottomNavigation />}
          <ScrollToTop />
          <ToastContainer />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <BackendStatus />
      <AppContent />
    </Router>
  );
}

export default App;
