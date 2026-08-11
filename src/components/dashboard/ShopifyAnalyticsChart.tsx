import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, Calendar, BarChart3, PieChart, Layers } from 'lucide-react';

interface MetricPoint {
  date: string;
  shortDate: string;
  sales: number;
  orders: number;
  aov: number;
  prevSales: number;
}

const METRIC_DATA_7D: MetricPoint[] = [
  { date: 'Aug 3, 2026', shortDate: 'Mon 3', sales: 38200, orders: 14, aov: 2728, prevSales: 32000 },
  { date: 'Aug 4, 2026', shortDate: 'Tue 4', sales: 44500, orders: 16, aov: 2781, prevSales: 36500 },
  { date: 'Aug 5, 2026', shortDate: 'Wed 5', sales: 51000, orders: 19, aov: 2684, prevSales: 41200 },
  { date: 'Aug 6, 2026', shortDate: 'Thu 6', sales: 49800, orders: 18, aov: 2766, prevSales: 43000 },
  { date: 'Aug 7, 2026', shortDate: 'Fri 7', sales: 56400, orders: 21, aov: 2685, prevSales: 48000 },
  { date: 'Aug 8, 2026', shortDate: 'Sat 8', sales: 56600, orders: 22, aov: 2572, prevSales: 50100 },
  { date: 'Aug 9, 2026', shortDate: 'Sun 9 (Today)', sales: 48500, orders: 18, aov: 2694, prevSales: 44200 },
];

const METRIC_DATA_30D: MetricPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const baseSales = 35000 + Math.sin(i / 2) * 12000 + (i % 7 === 5 || i % 7 === 6 ? 15000 : 0);
  const sales = Math.round(baseSales);
  const orders = Math.round(sales / 2650);
  return {
    date: `Jul ${11 + i}, 2026`,
    shortDate: `${11 + i}`,
    sales,
    orders,
    aov: Math.round(sales / orders),
    prevSales: Math.round(baseSales * 0.85),
  };
});

export const StoreAnalyticsChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState<'sales' | 'orders' | 'aov'>('sales');
  const [hoveredPoint, setHoveredPoint] = useState<MetricPoint | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = timeRange === '7d' ? METRIC_DATA_7D : METRIC_DATA_30D;

  const totalSales = data.reduce((acc, curr) => acc + curr.sales, 0);
  const totalOrders = data.reduce((acc, curr) => acc + curr.orders, 0);
  const avgAov = Math.round(totalSales / totalOrders);

  // SVG Chart Dimensions
  const chartHeight = 210;
  const chartWidth = 720;
  const padding = 28;

  const getVal = (pt: MetricPoint) => {
    if (activeTab === 'sales') return pt.sales;
    if (activeTab === 'orders') return pt.orders;
    return pt.aov;
  };

  const getPrevVal = (pt: MetricPoint) => {
    if (activeTab === 'sales') return pt.prevSales;
    if (activeTab === 'orders') return Math.round(pt.prevSales / 2650);
    return Math.round(pt.prevSales / Math.round(pt.prevSales / 2650));
  };

  const values = data.map(getVal);
  const prevValues = data.map(getPrevVal);
  const maxVal = Math.max(...values, ...prevValues, 1) * 1.12;
  const minVal = 0;

  const getX = (idx: number) => {
    return padding + (idx / (data.length - 1)) * (chartWidth - padding * 2);
  };

  const getY = (val: number) => {
    return chartHeight - padding - ((val - minVal) / (maxVal - minVal)) * (chartHeight - padding * 2);
  };

  const points = data.map((pt, idx) => ({ x: getX(idx), y: getY(getVal(pt)) }));
  const prevPoints = data.map((pt, idx) => ({ x: getX(idx), y: getY(getPrevVal(pt)) }));

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = a[i - 1];
      const cp1X = prev.x + (point.x - prev.x) / 2;
      const cp1Y = prev.y;
      const cp2X = prev.x + (point.x - prev.x) / 2;
      const cp2Y = point.y;
      return `${acc} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${point.x},${point.y}`;
    }, '');
  };

  const currentPath = createSmoothPath(points);
  const prevPath = createSmoothPath(prevPoints);

  const areaPath = `${currentPath} L ${points[points.length - 1].x},${chartHeight - padding} L ${points[0].x},${chartHeight - padding} Z`;

  const activePoint = hoveredPoint || data[data.length - 1];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
      {/* Clean Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              Real-Time Sales Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">Bandra Mumbai Store</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-1">
            Revenue & Sales Trend Analysis
          </h2>
        </div>

        {/* Time Selector Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === '7d'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === '30d'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tab 1: Total Sales */}
        <button
          onClick={() => setActiveTab('sales')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'sales'
              ? 'bg-emerald-50/40 border-[#008060] shadow-2xs ring-1 ring-[#008060]'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
          }`}
        >
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">Total Sales</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              ₹{totalSales.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +16.4%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">vs previous period (₹2,96,000)</span>
        </button>

        {/* Tab 2: Orders */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'orders'
              ? 'bg-emerald-50/40 border-[#008060] shadow-2xs ring-1 ring-[#008060]'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
          }`}
        >
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">Shoe POS Orders</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{totalOrders} Orders</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.8%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">129 footwear pairs sold</span>
        </button>

        {/* Tab 3: Average Order Value */}
        <button
          onClick={() => setActiveTab('aov')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'aov'
              ? 'bg-emerald-50/40 border-[#008060] shadow-2xs ring-1 ring-[#008060]'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
          }`}
        >
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">Avg Order Value (AOV)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              ₹{avgAov.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4.2%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Avg 1.4 pairs per ticket</span>
        </button>
      </div>

      {/* SVG Chart Area */}
      <div className="relative pt-1">
        {/* Tooltip display banner */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-mono mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">{activePoint.date}</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 mr-1.5">
                {activeTab === 'sales' ? 'Revenue:' : activeTab === 'orders' ? 'Orders:' : 'AOV:'}
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                {activeTab === 'sales'
                  ? `₹${activePoint.sales.toLocaleString('en-IN')}`
                  : activeTab === 'orders'
                  ? `${activePoint.orders} orders`
                  : `₹${activePoint.aov.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="hidden sm:block text-slate-400 text-[11px]">
              Prev: ₹{activePoint.prevSales.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto max-h-[250px] overflow-visible"
          >
            <defs>
              <linearGradient id="storeGreenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#008060" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#008060" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding + ratio * (chartHeight - padding * 2);
              return (
                <line
                  key={idx}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#storeGreenGradient)" />

            {/* Previous Period Dashed Curve */}
            <path
              d={prevPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* Current Period Solid Curve */}
            <path
              d={currentPath}
              fill="none"
              stroke="#008060"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points */}
            {data.map((pt, idx) => {
              const x = getX(idx);
              const val = getVal(pt);
              const y = getY(val);
              const isHovered = hoverIndex === idx;

              return (
                <g key={idx} className="cursor-pointer">
                  {isHovered && (
                    <line
                      x1={x}
                      y1={padding}
                      x2={x}
                      y2={chartHeight - padding}
                      stroke="#008060"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {isHovered && <circle cx={x} cy={y} r="7" fill="#008060" fillOpacity="0.25" />}

                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? '4.5' : '3.5'}
                    fill="#008060"
                    stroke="#ffffff"
                    strokeWidth="2"
                    onMouseEnter={() => {
                      setHoveredPoint(pt);
                      setHoverIndex(idx);
                    }}
                    onMouseLeave={() => {
                      setHoveredPoint(null);
                      setHoverIndex(null);
                    }}
                  />

                  <rect
                    x={x - (chartWidth / data.length) / 2}
                    y={0}
                    width={chartWidth / data.length}
                    height={chartHeight}
                    fill="transparent"
                    onMouseEnter={() => {
                      setHoveredPoint(pt);
                      setHoverIndex(idx);
                    }}
                    onMouseLeave={() => {
                      setHoveredPoint(null);
                      setHoverIndex(null);
                    }}
                  />
                </g>
              );
            })}

            {/* X-Axis Labels */}
            {data.map((pt, idx) => {
              if (timeRange === '30d' && idx % 5 !== 0 && idx !== data.length - 1) return null;
              const x = getX(idx);
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="system-ui"
                >
                  {pt.shortDate}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#008060] inline-block"></span>
              <span className="font-semibold text-slate-700">Current Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-400 inline-block"></span>
              <span>Previous Benchmark</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Sync: Real-Time</span>
        </div>
      </div>
    </div>
  );
};

// Also export as ShopifyAnalyticsChart alias to preserve compatibility if needed elsewhere
export const ShopifyAnalyticsChart = StoreAnalyticsChart;
