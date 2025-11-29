'use client';

interface TabProgressIndicatorProps {
  activeIndex: number;
  totalTabs: number;
}

export default function TabProgressIndicator({ activeIndex, totalTabs }: TabProgressIndicatorProps) {
  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent">
      <div 
        className="h-full bg-gradient-to-r from-accent to-green-500 transition-all duration-500 ease-out shadow-lg"
        style={{
          width: `${((activeIndex + 1) / totalTabs) * 100}%`,
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)'
        }}
      />
    </div>
  );
}