import * as Icons from "lucide-react";

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ 
  icon, 
  color, 
  size = 20, 
  className = "" 
}: CategoryIconProps) {
  const Icon = (Icons as any)[icon] || Icons.Wallet;
  
  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{
        backgroundColor: `${color}15`,
        width: size * 2,
        height: size * 2,
      }}
    >
      <Icon
        style={{ color }}
        className="transition-all"
        size={size}
      />
    </div>
  );
}
