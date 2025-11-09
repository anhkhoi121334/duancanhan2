import React from 'react';

const BackendStatus = () => {
  // Component đã bị disable - không còn check backend health
  // Nếu cần enable lại, uncomment code bên dưới
  
  return null; // Không hiển thị gì cả
  
  /* DISABLED - Uncomment để enable lại
  const [isChecking, setIsChecking] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      const status = await checkBackendHealth();
      setIsOnline(status);
      setShowWarning(!status);
      setIsChecking(false);
    };

    // Check on mount
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking || isOnline) {
    return null;
  }

  if (!showWarning) {
    return null;
  }
  */

  /* DISABLED - Warning banner code
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-3 shadow-lg">
      ...
    </div>
  );
  */
};

export default BackendStatus;

