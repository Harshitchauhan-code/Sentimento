import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const Particles = () => {
  const canvasRef = useRef(null);
  const { currentAnalysis } = useAuth(); // Assuming analysis context exists
  
  const getColor = (sentiment) => {
    if (!sentiment) return '59, 130, 246'; // Blue (neutral)
    return sentiment > 0.3 ? '16, 185, 129' : // Green (positive)
           sentiment < -0.3 ? '239, 68, 68' : // Red (negative)
           '59, 130, 246'; // Blue (neutral)
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.angle += 0.002;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(${getColor(currentAnalysis?.score)}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array(150).fill().map(() => new Particle());
    };
    
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, [currentAnalysis]);

  return <canvas ref={canvasRef} style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    pointerEvents: 'none' 
  }} />;
};

export default Particles; 