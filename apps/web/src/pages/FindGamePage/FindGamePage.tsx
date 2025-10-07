import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';

const FindGamePage = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const [, navigate] = useLocation();
  if (!isAuthenticated && !isCheckingAuth) {
    navigate('/login');
  }

  return (
    <>
      <h1>Find game</h1>
      <button>Quick match</button>
      <button>Host private game</button>
      <button>Join private game</button>
    </>
  );
};

export default FindGamePage;
