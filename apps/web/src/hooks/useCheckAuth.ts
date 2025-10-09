import { useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useLocation } from 'wouter';

const useCheckAuth = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      navigate('/');
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);
};

export default useCheckAuth;
