import { useEffect, useState } from 'react';

export default function Countdown({ isoTarget, label = 'Next Mystery' }){
  // 1. Initialize state with a static value ('Loading…') for SSR
  const [left, setLeft] = useState('Loading…');
  // 2. State to explicitly track if the component has fully mounted on the client.
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 3. Set to true immediately upon client-side mount.
    setIsClient(true); 

    if(!isoTarget) return;
    
    const target = new Date(isoTarget).getTime();
    let id; 
    
    function tick(){
      // All time-dependent calculations are inside this function, which runs only on the client
      const now = Date.now();
      const diff = target - now;
      if(diff <= 0){
        setLeft('Available now');
        clearInterval(id); 
        return;
      }
      
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      
      const pad = (num) => (num < 10 ? '0' + num : num);

      setLeft(`${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`);
    }
    
    tick(); 
    id = setInterval(tick,1000);
    
    // Cleanup function
    return () => clearInterval(id); 
  }, [isoTarget]);

  // 4. Render static 'Loading...' on server, calculated value on client
  const countdownContent = isClient ? left : 'Loading…';

  return (
    <div className="aside-card card" aria-live="polite">
      <h3>{label}</h3>
      <div id="countdown">{countdownContent}</div>
    </div>
  )
}
