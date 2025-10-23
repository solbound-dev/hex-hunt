import { useEffect, useState } from 'react';

const useScreenSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleWindowResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleWindowResize);

    return () => removeEventListener('resize', handleWindowResize);
  }, []);

  return size;
};

export default useScreenSize;
