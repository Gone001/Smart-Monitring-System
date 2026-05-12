import { useRef } from 'react';

const SpotlightCard = ({ children, className = '', borderColor = 'transparent', gradient = 'transparent', onClick }) => {
  const cardRef = useRef(null);

  const handleMouseMove = e => {
    const c = cardRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`group relative overflow-hidden transition-colors duration-300 ${className}`}
      style={{
        '--spotlight-color': 'rgba(255,255,255,0.3)'
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-10"
        style={{
          background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
        }}
      />
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;