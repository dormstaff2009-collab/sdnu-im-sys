import React, { useState } from 'react';
import { formatCurrency } from '../utils/exportUtils';

export interface PieChartItem {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number; // e.g. monetary value in THB
  color: string;
  badgeBg?: string;
  badgeText?: string;
}

interface PieChartProps {
  title: string;
  subtitle?: string;
  data: PieChartItem[];
  totalLabel?: string;
  valueUnit?: string;
  isCurrency?: boolean;
  onSliceClick?: (item: PieChartItem) => void;
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  title,
  subtitle,
  data,
  totalLabel = 'ทั้งหมด',
  valueUnit = 'รายการ',
  isCurrency = false,
  onSliceClick,
  size = 240
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Compute slices
  let cumulativeAngle = 0;
  const radius = size / 2;
  const innerRadius = radius * 0.58; // Donut style for modern readable look
  const center = radius;

  const slices = data.map((item, idx) => {
    if (total === 0 || item.value === 0) {
      return {
        ...item,
        path: '',
        percentage: 0,
        startAngle: 0,
        endAngle: 0,
        midAngle: 0
      };
    }

    const sliceAngle = (item.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    // Convert degrees to radians (offset by -90 deg so slice starts at 12 o'clock)
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const midAngle = startAngle + sliceAngle / 2;

    const isHovered = hoveredIndex === idx;
    const currentRadius = isHovered ? radius - 2 : radius - 8;
    const currentInnerRadius = isHovered ? innerRadius - 2 : innerRadius;

    // Points
    const x1 = center + currentRadius * Math.cos(startRad);
    const y1 = center + currentRadius * Math.sin(startRad);
    const x2 = center + currentRadius * Math.cos(endRad);
    const y2 = center + currentRadius * Math.sin(endRad);

    const x3 = center + currentInnerRadius * Math.cos(endRad);
    const y3 = center + currentInnerRadius * Math.sin(endRad);
    const x4 = center + currentInnerRadius * Math.cos(startRad);
    const y4 = center + currentInnerRadius * Math.sin(startRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    // SVG arc path
    // If it's a full circle (100%)
    let path = '';
    if (sliceAngle >= 359.9) {
      path = `
        M ${center} ${center - currentRadius}
        A ${currentRadius} ${currentRadius} 0 1 1 ${center} ${center + currentRadius}
        A ${currentRadius} ${currentRadius} 0 1 1 ${center} ${center - currentRadius}
        M ${center} ${center - currentInnerRadius}
        A ${currentInnerRadius} ${currentInnerRadius} 0 1 0 ${center} ${center + currentInnerRadius}
        A ${currentInnerRadius} ${currentInnerRadius} 0 1 0 ${center} ${center - currentInnerRadius}
        Z
      `;
    } else {
      path = [
        `M ${x1} ${y1}`,
        `A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${currentInnerRadius} ${currentInnerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');
    }

    const percentage = ((item.value / total) * 100).toFixed(1);

    return {
      ...item,
      path,
      percentage,
      startAngle,
      endAngle,
      midAngle
    };
  });

  const activeItem = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
      {/* Title Header */}
      <div className="mb-3">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Main Chart Graphic & Tooltip/Center Information */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Circle View */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="overflow-visible select-none">
            {total === 0 ? (
              <circle
                cx={center}
                cy={center}
                r={radius - 8}
                fill="#f1f5f9"
                stroke="#e2e8f0"
                strokeWidth={1}
              />
            ) : (
              slices.map((slice, idx) => {
                if (!slice.path) return null;
                const isHovered = hoveredIndex === idx;
                return (
                  <path
                    key={slice.id || idx}
                    d={slice.path}
                    fill={slice.color}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))' : 'none',
                      opacity: hoveredIndex !== null && !isHovered ? 0.65 : 1
                    }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onSliceClick && onSliceClick(slice)}
                  />
                );
              })
            )}
          </svg>

          {/* Center Info Text (Donut Center Hole) */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2"
          >
            {activeItem ? (
              <div className="animate-fade-in">
                <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                  {activeItem.label}
                </span>
                <span className="text-lg font-bold text-slate-900 block leading-tight">
                  {activeItem.value.toLocaleString()} <span className="text-xs font-normal text-slate-500">{valueUnit}</span>
                </span>
                <span className="text-xs font-bold text-blue-600 block">
                  {activeItem.percentage}%
                </span>
                {activeItem.secondaryValue !== undefined && activeItem.secondaryValue > 0 && (
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    {formatCurrency(activeItem.secondaryValue)}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {totalLabel}
                </span>
                <span className="text-xl font-bold text-slate-900 block leading-tight">
                  {isCurrency ? formatCurrency(total) : total.toLocaleString()}
                </span>
                {!isCurrency && (
                  <span className="text-[11px] text-slate-500 block">
                    {valueUnit}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-1.5 max-h-56 overflow-y-auto text-xs pr-1">
          {slices.map((slice, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={slice.id || idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSliceClick && onSliceClick(slice)}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-100 shadow-2xs font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate text-slate-800 text-[11px]">{slice.label}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 text-right text-[11px]">
                  <span className="font-bold text-slate-900">{slice.value.toLocaleString()}</span>
                  <span className="text-slate-400 text-[10px] w-9 text-right font-medium">({slice.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[10px] text-slate-400 text-right pt-2 border-t border-slate-100">
        * คลิกที่ชิ้นแผนภูมิเพื่อกรองรายการ
      </div>
    </div>
  );
};
