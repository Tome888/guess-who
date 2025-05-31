import React, { useRef, useEffect } from "react";

interface ConfettiProps {
  active: boolean;
}

interface ConfettiParticle {
  x: number;
  y: number;
  speed: number;
  size: number;
}

const Sad: React.FC<ConfettiProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const emoji = "☹️";

    const generateParticles = () => {
      const particles: ConfettiParticle[] = [];
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          speed: Math.random() * 20 + 1,
          size: Math.random() * 24 + 16,
        });
      }
      return particles;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = "20px sans-serif";

      particlesRef.current.forEach((p) => {
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillText(emoji, p.x, p.y);
      });

      update();
    };

    const update = () => {
      particlesRef.current.forEach((p) => {
        p.y += p.speed;
        if (p.y > height) {
          p.y = -30;
          p.x = Math.random() * width;
        }
      });
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (active) {
      particlesRef.current = generateParticles();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationRef.current!);
      ctx.clearRect(0, 0, width, height);
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationRef.current!);
      window.removeEventListener("resize", handleResize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default Sad;
