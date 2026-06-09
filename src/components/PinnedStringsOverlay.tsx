import { useState, useEffect, useRef, useCallback } from "react";
import { Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PinnedStringData {
  id: string;
  mpptIndex: number;
  panelName: string;
  panelCount: number;
  winterVoc: number;
}

const PinnedStringsOverlay = () => {
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('stringKalkulator_isPinned');
    return saved === 'true';
  });
  const [pinnedPosition, setPinnedPosition] = useState(() => {
    const saved = localStorage.getItem('stringKalkulator_pinnedPosition');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const [pinnedData, setPinnedData] = useState<PinnedStringData[]>(() => {
    const saved = localStorage.getItem('stringKalkulator_pinnedData');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  // Listen for storage events to sync across tabs/pages
  useEffect(() => {
    const handleStorageChange = () => {
      const savedPinned = localStorage.getItem('stringKalkulator_isPinned');
      const savedPosition = localStorage.getItem('stringKalkulator_pinnedPosition');
      const savedData = localStorage.getItem('stringKalkulator_pinnedData');
      
      setIsPinned(savedPinned === 'true');
      if (savedPosition) setPinnedPosition(JSON.parse(savedPosition));
      if (savedData) setPinnedData(JSON.parse(savedData));
    };

    // Listen for custom event from same window
    window.addEventListener('pinnedStringsUpdate', handleStorageChange);
    // Listen for storage events from other windows
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('pinnedStringsUpdate', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pinnedPosition.x,
      initialY: pinnedPosition.y,
    };
  }, [pinnedPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    const newPosition = {
      x: dragRef.current.initialX + deltaX,
      y: dragRef.current.initialY + deltaY,
    };
    setPinnedPosition(newPosition);
    localStorage.setItem('stringKalkulator_pinnedPosition', JSON.stringify(newPosition));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  const handleClose = () => {
    setIsPinned(false);
    localStorage.setItem('stringKalkulator_isPinned', 'false');
    window.dispatchEvent(new Event('pinnedStringsUpdate'));
  };

  if (!isPinned || pinnedData.length === 0) return null;

  return (
    <div 
      className={`fixed z-50 bg-background border rounded-lg shadow-lg p-3 min-w-[280px] max-w-[350px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        bottom: pinnedPosition.y === 0 ? '1rem' : 'auto',
        right: pinnedPosition.x === 0 ? '1rem' : 'auto',
        top: pinnedPosition.y !== 0 ? `calc(50% + ${pinnedPosition.y}px)` : 'auto',
        left: pinnedPosition.x !== 0 ? `calc(50% + ${pinnedPosition.x}px)` : 'auto',
        transform: pinnedPosition.x !== 0 || pinnedPosition.y !== 0 ? 'translate(-50%, -50%)' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          String konfiguráció
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 text-xs">
        {pinnedData.map((item) => (
          <div key={item.id} className="bg-muted/50 rounded p-2">
            <div className="font-medium text-primary">MPPT {item.mpptIndex + 1}</div>
            <div className="text-muted-foreground">{item.panelName}</div>
            <div className="flex justify-between mt-1">
              <span>{item.panelCount} db</span>
              <span className="text-orange-500 font-medium">
                Téli Voc: {item.winterVoc.toFixed(1)} V
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedStringsOverlay;
