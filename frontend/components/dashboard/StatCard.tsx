import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  iconBg?: string;
  className?: string;
}

export function StatCard({
  icon,
  value,
  label,
  change,
  changeType = 'neutral',
  iconBg = 'bg-[#EAF4FB]',
  className,
}: StatCardProps) {
  const changeColors = {
    up: 'text-green-600',
    down: 'text-[#C0392B]',
    neutral: 'text-[#5D8AA8]',
  };

  const ChangeIcon =
    changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-[#D6E8F5] shadow-card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow duration-200',
        className
      )}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-[#1A2A3A] leading-none">{value}</p>
        <p className="text-sm text-[#5D8AA8] mt-1 truncate">{label}</p>
        {change && (
          <div className={cn('flex items-center gap-1 mt-1.5', changeColors[changeType])}>
            <ChangeIcon size={12} />
            <span className="text-xs font-medium">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
