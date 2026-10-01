import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Building2,
  Calendar,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AlumniDistributionChartProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
}

// St. Cecilia Institutional Collegiate Palette (Deep Crimson, Warm Amber, Forest Emerald, Terracotta, Slate)
const DEPARTMENT_COLORS = [
  '#8B181B', // St. Cecilia Deep Crimson
  '#B45309', // Warm Amber
  '#047857', // Deep Emerald
  '#721316', // Burgundy
  '#C2410C', // Terracotta
  '#475569', // Slate
  '#D97706', // Ochre Gold
  '#78716c'  // Warm Taupe
];

const BATCH_COLORS = [
  '#8B181B', // Class of 2026/Latest (Deep Crimson)
  '#991B1B', // Crimson
  '#B45309', // Amber
  '#C2410C', // Terracotta
  '#047857', // Forest
  '#475569', // Slate
  '#64748b', // Light Slate
  '#78716c'  // Stone (Earlier)
];

// Helper to normalize course into institutional academic department
function getDepartmentFromProfile(user: UserProfile): string {
  if (user.department && user.department.trim() && user.department !== 'N/A') {
    return user.department;
  }
  const course = (user.course || '').toLowerCase();
  if (course.includes('information technology') || course.includes('computer science') || course.includes('software')) {
    return 'Information Technology & CS';
  }
  if (course.includes('accountancy') || course.includes('business') || course.includes('marketing') || course.includes('finance')) {
    return 'Business & Accountancy';
  }
  if (course.includes('nursing') || course.includes('health') || course.includes('clinical') || course.includes('medical')) {
    return 'Nursing & Health Sciences';
  }
  if (course.includes('education') || course.includes('arts') || course.includes('english')) {
    return 'Education & Liberal Arts';
  }
  if (course.includes('hospitality') || course.includes('tourism') || course.includes('hotel')) {
    return 'Hospitality & Tourism Mgmt';
  }
  if (course.includes('engineering') || course.includes('civil') || course.includes('electrical')) {
    return 'College of Engineering';
  }
  if (course.includes('criminology') || course.includes('justice')) {
    return 'College of Criminology';
  }
  return user.course || 'Institutional Programs';
}

// Compute SVG path for a donut arc segment
function getArcPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  // If single slice occupies full circle
  if (endAngle - startAngle >= 2 * Math.PI - 0.001) {
    return `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy + rOuter} A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy - rOuter} M ${cx} ${cy - rInner} A ${rInner} ${rInner} 0 1 1 ${cx} ${cy + rInner} A ${rInner} ${rInner} 0 1 1 ${cx} ${cy - rInner} Z`;
  }

  const x1 = cx + rOuter * Math.cos(startAngle);
  const y1 = cy + rOuter * Math.sin(startAngle);
  const x2 = cx + rOuter * Math.cos(endAngle);
  const y2 = cy + rOuter * Math.sin(endAngle);
  const x3 = cx + rInner * Math.cos(endAngle);
  const y3 = cy + rInner * Math.sin(endAngle);
  const x4 = cx + rInner * Math.cos(startAngle);
  const y4 = cy + rInner * Math.sin(startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

export const AlumniDistributionChart: React.FC<AlumniDistributionChartProps> = ({
  users,
  currentUser
}) => {
  const [viewMode, setViewMode] = useState<'department' | 'batch'>('department');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Filter to alumni community members
  const alumniUsers = useMemo(() => {
    const list = users.filter((u) => u.role === 'alumni');
    return list.length > 0 ? list : users;
  }, [users]);

  // Aggregate by Department
  const departmentData = useMemo(() => {
    const map = new Map<string, number>();
    alumniUsers.forEach((u) => {
      const dept = getDepartmentFromProfile(u);
      map.set(dept, (map.get(dept) || 0) + 1);
    });

    const total = alumniUsers.length || 1;
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: Number(((value / total) * 100).toFixed(1))
      }))
      .sort((a, b) => b.value - a.value);
  }, [alumniUsers]);

  // Aggregate by Graduation Batch / Year
  const batchData = useMemo(() => {
    const map = new Map<string, number>();
    alumniUsers.forEach((u) => {
      const batch = u.batch && u.batch.trim() && u.batch !== 'N/A' ? `Class of ${u.batch}` : 'Earlier Cohorts';
      map.set(batch, (map.get(batch) || 0) + 1);
    });

    const total = alumniUsers.length || 1;
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: Number(((value / total) * 100).toFixed(1))
      }))
      .sort((a, b) => {
        const yearA = parseInt(a.name.replace(/\D/g, ''), 10) || 0;
        const yearB = parseInt(b.name.replace(/\D/g, ''), 10) || 0;
        return yearB - yearA;
      });
  }, [alumniUsers]);

  const activeData = viewMode === 'department' ? departmentData : batchData;
  const activeColors = viewMode === 'department' ? DEPARTMENT_COLORS : BATCH_COLORS;

  // Key metrics
  const topDepartment = departmentData[0]?.name || 'N/A';
  const topBatch = batchData[0]?.name || 'N/A';
  const totalGraduates = alumniUsers.length;

  // User's department or batch in the chart
  const userDept = currentUser ? getDepartmentFromProfile(currentUser) : null;
  const userBatch = currentUser?.batch ? `Class of ${currentUser.batch}` : null;

  // Compute donut slices angles with gaps
  const slices = useMemo(() => {
    const total = activeData.reduce((acc, curr) => acc + curr.value, 0) || 1;
    let currentAngle = -Math.PI / 2; // Start from top 12 o'clock

    return activeData.map((item, index) => {
      const sliceAngle = (item.value / total) * (2 * Math.PI);
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle += sliceAngle;

      const pad = activeData.length > 1 ? Math.min(0.03, sliceAngle * 0.1) : 0;
      const paddedStart = startAngle + pad / 2;
      const paddedEnd = endAngle - pad / 2;

      return {
        ...item,
        index,
        color: activeColors[index % activeColors.length],
        startAngle,
        endAngle,
        paddedStart,
        paddedEnd
      };
    });
  }, [activeData, activeColors]);

  const activeSegmentName = hoveredSegment || selectedSegment;
  const activeSegmentData = activeData.find((d) => d.name === activeSegmentName);

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] space-y-4 sm:space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center shrink-0 shadow-2xs">
              <PieChartIcon className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 tracking-tight break-words">
                  Alumni Demographics & Cohort Distribution
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-[#8B181B]/5 text-[#8B181B] border border-[#8B181B]/15 shrink-0">
                  {totalGraduates} Verified Records
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 break-words mt-0.5">
                Institutional distribution of Cecilian alumni across graduation cohorts and academic disciplines
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl shrink-0 self-start sm:self-center overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              setViewMode('department');
              setSelectedSegment(null);
              setHoveredSegment(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'department'
                ? 'bg-white text-[#8B181B] shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>By Department</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('batch');
              setSelectedSegment(null);
              setHoveredSegment(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'batch'
                ? 'bg-white text-[#8B181B] shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>By Cohort Year</span>
          </button>
        </div>
      </div>

      {/* Highlights Bento Bar */}
      <div className="w-full max-w-full overflow-x-hidden grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-xl border border-stone-200/80 hover:border-[#8B181B]/30 transition-colors min-w-0">
          <div className="flex items-center justify-between text-stone-500 text-[10px] sm:text-[11px] font-medium">
            <span className="truncate">Verified Alumni</span>
            <Users className="w-3.5 h-3.5 text-[#8B181B] shrink-0" />
          </div>
          <div className="mt-1 font-bold text-lg sm:text-xl md:text-2xl text-stone-900 tracking-tight">{totalGraduates}</div>
          <div className="text-[9px] sm:text-[10px] text-stone-500 truncate">Official registrar records</div>
        </div>

        <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-xl border border-stone-200/80 hover:border-[#8B181B]/30 transition-colors min-w-0">
          <div className="flex items-center justify-between text-stone-500 text-[10px] sm:text-[11px] font-medium">
            <span className="truncate">Top Department</span>
            <Building2 className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
          </div>
          <div className="mt-1 font-bold text-sm sm:text-base md:text-lg text-stone-900 truncate" title={topDepartment}>
            {topDepartment}
          </div>
          <div className="text-[9px] sm:text-[10px] text-[#B45309] font-medium">
            {departmentData[0]?.percentage || 0}% of alumni census
          </div>
        </div>

        <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-xl border border-stone-200/80 hover:border-[#8B181B]/30 transition-colors min-w-0">
          <div className="flex items-center justify-between text-stone-500 text-[10px] sm:text-[11px] font-medium">
            <span className="truncate">Primary Cohort</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#047857] shrink-0" />
          </div>
          <div className="mt-1 font-bold text-sm sm:text-base md:text-lg text-stone-900 truncate" title={topBatch}>
            {topBatch}
          </div>
          <div className="text-[9px] sm:text-[10px] text-[#047857] font-medium">
            {batchData[0]?.value || 0} registered graduates
          </div>
        </div>

        <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-xl border border-stone-200/80 hover:border-[#8B181B]/30 transition-colors min-w-0">
          <div className="flex items-center justify-between text-stone-500 text-[10px] sm:text-[11px] font-medium">
            <span className="truncate">Your Affiliation</span>
            <Award className="w-3.5 h-3.5 text-[#8B181B] shrink-0" />
          </div>
          <div className="mt-1 font-bold text-sm sm:text-base md:text-lg text-stone-900 truncate">
            {viewMode === 'department' ? (userDept || 'General') : (userBatch || 'Alumni')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-stone-500 truncate" title={currentUser?.course}>
            {currentUser?.course || 'Enrolled Member'}
          </div>
        </div>
      </div>

      {/* Main Chart + Legend Display */}
      <div className="w-full max-w-full overflow-x-hidden grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center pt-2">
        {/* Interactive SVG Donut Chart Canvas */}
        <div
          className="lg:col-span-5 h-64 sm:h-72 w-full flex items-center justify-center relative select-none"
          onMouseLeave={() => {
            setHoveredSegment(null);
            setTooltipPos(null);
          }}
        >
          <svg
            viewBox="0 0 280 280"
            className="w-56 h-56 sm:w-64 sm:h-64 transform drop-shadow-xs"
          >
            <g transform="translate(140, 140)">
              {slices.map((slice) => {
                const isSelected = selectedSegment === slice.name;
                const isHovered = hoveredSegment === slice.name;
                const isUserCohort =
                  (viewMode === 'department' && userDept === slice.name) ||
                  (viewMode === 'batch' && userBatch === slice.name);

                const rInner = 68;
                const rOuter = isSelected ? 106 : isHovered ? 104 : 98;
                const pathData = getArcPath(0, 0, rInner, rOuter, slice.paddedStart, slice.paddedEnd);

                return (
                  <path
                    key={slice.name}
                    d={pathData}
                    fill={slice.color}
                    stroke={isSelected ? '#721316' : isUserCohort ? '#8B181B' : '#ffffff'}
                    strokeWidth={isSelected ? 3 : isUserCohort ? 2.5 : 1.5}
                    className="cursor-pointer transition-all duration-200 hover:opacity-90"
                    onMouseEnter={(e) => {
                      setHoveredSegment(slice.name);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      });
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      });
                    }}
                    onClick={() => {
                      setSelectedSegment(selectedSegment === slice.name ? null : slice.name);
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Centered Donut Summary */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeSegmentData ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B181B] truncate max-w-[140px]">
                  {activeSegmentData.name}
                </span>
                <span className="text-2xl font-bold text-stone-900 leading-none mt-0.5 tracking-tight">
                  {activeSegmentData.value}
                </span>
                <span className="text-[11px] font-semibold text-stone-500 mt-1">
                  {activeSegmentData.percentage}% of Census
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {viewMode === 'department' ? 'Departments' : 'Grad Batches'}
                </span>
                <span className="text-2xl font-bold text-stone-900 leading-none mt-0.5 tracking-tight">
                  {activeData.length}
                </span>
                <span className="text-[10px] text-[#8B181B] font-semibold mt-1">
                  Active Segments
                </span>
              </>
            )}
          </div>
        </div>

        {/* Detailed Breakdown Legend List with Progress Bars */}
        <div className="lg:col-span-7 space-y-2 max-h-72 overflow-y-auto pr-1">
          <div className="text-xs font-bold text-stone-700 flex items-center justify-between pb-1.5 border-b border-stone-100">
            <span>
              {viewMode === 'department' ? 'Academic Program / Department' : 'Graduation Batch Cohort'}
            </span>
            <span className="text-stone-400">Alumni / Percentage</span>
          </div>

          {activeData.map((item, index) => {
            const isSelected = selectedSegment === item.name;
            const isHovered = hoveredSegment === item.name;
            const isUserCohort =
              (viewMode === 'department' && userDept === item.name) ||
              (viewMode === 'batch' && userBatch === item.name);

            return (
              <div
                key={item.name}
                onClick={() => setSelectedSegment(isSelected ? null : item.name)}
                onMouseEnter={() => setHoveredSegment(item.name)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex flex-col p-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-red-50/70 border border-red-200/80 shadow-2xs'
                    : isHovered
                    ? 'bg-stone-50/90 border border-stone-200/80'
                    : 'hover:bg-stone-50/70 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                      style={{ backgroundColor: activeColors[index % activeColors.length] }}
                    />
                    <div className="truncate">
                      <span className="font-semibold text-stone-800 truncate block">
                        {item.name}
                      </span>
                      {isUserCohort && (
                        <span className="text-[10px] text-[#8B181B] font-bold block">
                          ★ Your Registered Cohort
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-stone-900">{item.value}</span>
                    <span className="text-[11px] text-stone-400 ml-1.5">({item.percentage}%)</span>
                  </div>
                </div>

                {/* Progress share bar */}
                <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(4, item.percentage))}%`,
                      backgroundColor: activeColors[index % activeColors.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
