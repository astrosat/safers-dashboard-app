import { useEffect }  from 'react';

const useInterval = (callback, interval, dependencies=[]) => {
  useEffect(() => {
    if(interval){
      const timer = setInterval(() => {
        callback();
      }, interval);
      return () => clearInterval(timer);
    }
  }, dependencies);
}

export default useInterval;