import React, { useRef, useEffect, useState, useCallback } from 'react';

interface FreehandCanvasProps {
  width: number;
  height: number;
  onExport: (base64: string) => void;
  isGrading: boolean;
}

const FreehandCanvas: React.FC<FreehandCanvasProps> = ({ width, height, onExport, isGrading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  // Setup canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High DPI fix
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1a1a1a'; // Ink color
      ctx.lineWidth = 12; // Brush width
      // Add a slight shadow to simulate ink absorption/depth
      ctx.shadowBlur = 1;
      ctx.shadowColor = '#1a1a1a';
    }
  }, [width, height]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = (event as React.MouseEvent).clientX;
        clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoordinates(e);
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoordinates(e);
    if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasContent(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear strict logic
      // Since we scaled context, clearRect might need adjustments if not using full width/height props
      // Re-clearing based on internal width/height is safer
      ctx.clearRect(0, 0, width, height); 
      setHasContent(false);
    }
  };

  const handleGrade = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onExport(dataUrl);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative border-2 border-red-500 bg-white shadow-xl tian-zi-ge cursor-crosshair touch-none"
           style={{ width, height }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 z-10"
        />
      </div>
      
      <div className="flex gap-2 w-full justify-center">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 text-sm text-stone-600 hover:text-red-600 transition-colors border border-stone-300 rounded hover:border-red-400 bg-white"
        >
          清空
        </button>
        <button
          onClick={handleGrade}
          disabled={!hasContent || isGrading}
          className={`px-6 py-2 text-sm font-bold text-white transition-all rounded shadow-md 
            ${!hasContent || isGrading 
              ? 'bg-stone-300 cursor-not-allowed' 
              : 'bg-stone-800 hover:bg-stone-900 active:scale-95'}`}
        >
          {isGrading ? '评分中...' : 'AI 智能评分'}
        </button>
      </div>
    </div>
  );
};

export default FreehandCanvas;