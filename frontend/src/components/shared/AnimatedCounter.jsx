import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, className = '' }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (prev.current === value) return;
    setAnimating(true);
    const start = prev.current;
    const diff = value - start;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prev.current = value;
        setTimeout(() => setAnimating(false), 100);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className={`${className} ${animating ? 'updated' : ''}`}>
      {display}
    </span>
  );
}
