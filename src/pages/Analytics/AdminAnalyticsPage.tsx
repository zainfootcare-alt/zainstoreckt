import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import {
  TrendingUp,
  Clock,
  ShoppingBag,
  Users,
  Sparkles,
  ArrowUpRight,
  Flame,
  Snowflake,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  Printer,
  Info,
  Award,
  ArrowLeft,
  CreditCard,
  UserCheck,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const { sales, customers, activeRole, activeShop } = useShop();
  const isAdmin = activeRole === 'ADMIN';

  // Date Filter: 'today' | 'this_week' | 'this_month' | 'all_time'
  const [dateFilter, setDateFilter] = useState<'today' | 'this_week' | 'this_month' | 'all_time'>('this_month');

  // Filter Sales based on Selected Period
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (dateFilter === 'today') {
      return sales.filter((s) => s.created_at.startsWith(todayStr));
    }

    if (dateFilter === 'this_week') {
      const currentDay = (now.getDay() + 6) % 7; // 0 = Mon
      const monday = new Date(now);
      monday.setDate(now.getDate() - currentDay);
      monday.setHours(0, 0, 0, 0);
      const mondayStr = monday.toISOString().split('T')[0];
      return sales.filter((s) => s.created_at.split('T')[0] >= mondayStr);
    }

    if (dateFilter === 'this_month') {
      const monthPrefix = todayStr.substring(0, 7); // 'YYYY-MM'
      return sales.filter((s) => s.created_at.startsWith(monthPrefix));
    }

    return sales;
  }, [sales, dateFilter]);

  // Overall Headline Metrics
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.total, 0);
  }, [filteredSales]);

  const totalOrdersCount = filteredSales.length;

  const averageOrderValue = useMemo(() => {
    return totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  }, [totalRevenue, totalOrdersCount]);

  // Multi-Item Upsell Rate
  const multiItemRate = useMemo(() => {
    if (totalOrdersCount === 0) return 0;
    const multiCount = filteredSales.filter((s) => (s.items?.length || 1) > 1).length;
    return Math.round((multiCount / totalOrdersCount) * 100);
  }, [filteredSales, totalOrdersCount]);

  // Repeat Customer Ratio
  const customerRetentionRate = useMemo(() => {
    if (totalOrdersCount === 0) return 0;
    const phoneCounts: Record<string, number> = {};
    sales.forEach((s) => {
      const p = s.customer_phone?.replace(/\D/g, '') || s.customer_id;
      if (p) phoneCounts[p] = (phoneCounts[p] || 0) + 1;
    });

    let repeatSalesCount = 0;
    filteredSales.forEach((s) => {
      const p = s.customer_phone?.replace(/\D/g, '') || s.customer_id;
      if (p && phoneCounts[p] > 1) repeatSalesCount++;
    });

    return Math.round((repeatSalesCount / totalOrdersCount) * 100);
  }, [filteredSales, sales, totalOrdersCount]);

  // =========================================================================
  // 1. SHOE SIZE DEMAND & SIZING INTELLIGENCE
  // =========================================================================
  const sizeAnalytics = useMemo(() => {
    const sizeMap: Record<string, { size: string; pairsSold: number; revenue: number }> = {};

    filteredSales.forEach((s) => {
      (s.items || []).forEach((item: any) => {
        let sz = (item.size || '').trim();
        if (!sz) sz = 'Standard';
        if (!sizeMap[sz]) {
          sizeMap[sz] = { size: sz, pairsSold: 0, revenue: 0 };
        }
        const qty = Number(item.quantity) || 1;
        sizeMap[sz].pairsSold += qty;
        sizeMap[sz].revenue += Number(item.unit_price || item.total_price || 0) * qty;
      });
    });

    const list = Object.values(sizeMap);
    if (list.length === 0) return [];

    const totalPairs = list.reduce((sum, it) => sum + it.pairsSold, 0) || 1;
    const sorted = list.sort((a, b) => b.pairsSold - a.pairsSold);

    return sorted.map((s) => {
      const sharePct = Math.round((s.pairsSold / totalPairs) * 100);
      let classification: 'HOT' | 'STEADY' | 'SLOW' = 'STEADY';
      if (sharePct >= 20) classification = 'HOT';
      else if (sharePct <= 8) classification = 'SLOW';

      return {
        ...s,
        sharePct,
        classification,
      };
    });
  }, [filteredSales]);

  const hotSizes = sizeAnalytics.filter((s) => s.classification === 'HOT').map((s) => s.size);
  const slowSizes = sizeAnalytics.filter((s) => s.classification === 'SLOW').map((s) => s.size);

  // =========================================================================
  // 2. CUSTOMER FOOTFALL & PEAK TIMING INTELLIGENCE
  // =========================================================================
  const hourlyFootfall = useMemo(() => {
    const hours = [
      { hour: 10, label: '10 AM', timeWindow: '10:00 - 11:00 AM', count: 0, revenue: 0 },
      { hour: 11, label: '11 AM', timeWindow: '11:00 AM - 12:00 PM', count: 0, revenue: 0 },
      { hour: 12, label: '12 PM', timeWindow: '12:00 - 1:00 PM', count: 0, revenue: 0 },
      { hour: 13, label: '1 PM', timeWindow: '1:00 - 2:00 PM', count: 0, revenue: 0 },
      { hour: 14, label: '2 PM', timeWindow: '2:00 - 3:00 PM', count: 0, revenue: 0 },
      { hour: 15, label: '3 PM', timeWindow: '3:00 - 4:00 PM', count: 0, revenue: 0 },
      { hour: 16, label: '4 PM', timeWindow: '4:00 - 5:00 PM', count: 0, revenue: 0 },
      { hour: 17, label: '5 PM', timeWindow: '5:00 - 6:00 PM', count: 0, revenue: 0 },
      { hour: 18, label: '6 PM', timeWindow: '6:00 - 7:00 PM', count: 0, revenue: 0 },
      { hour: 19, label: '7 PM', timeWindow: '7:00 - 8:00 PM', count: 0, revenue: 0 },
      { hour: 20, label: '8 PM', timeWindow: '8:00 - 9:00 PM', count: 0, revenue: 0 },
      { hour: 21, label: '9 PM', timeWindow: '9:00 - 10:00 PM', count: 0, revenue: 0 },
    ];

    filteredSales.forEach((s) => {
      const d = new Date(s.created_at);
      const h = d.getHours();
      const match = hours.find((item) => item.hour === h);
      if (match) {
        match.count += 1;
        match.revenue += s.total;
      }
    });

    const maxCount = Math.max(...hours.map((h) => h.count), 0);
    const peakHourItem = maxCount > 0 ? [...hours].sort((a, b) => b.count - a.count)[0] : null;

    return {
      hours,
      maxCount,
      peakHourItem: peakHourItem && peakHourItem.count > 0 ? peakHourItem : null,
    };
  }, [filteredSales]);

  // Day of Week Distribution
  const dayOfWeekStats = useMemo(() => {
    const days = [
      { dayIndex: 1, name: 'Mon', full: 'Monday', count: 0, revenue: 0, isWeekend: false },
      { dayIndex: 2, name: 'Tue', full: 'Tuesday', count: 0, revenue: 0, isWeekend: false },
      { dayIndex: 3, name: 'Wed', full: 'Wednesday', count: 0, revenue: 0, isWeekend: false },
      { dayIndex: 4, name: 'Thu', full: 'Thursday', count: 0, revenue: 0, isWeekend: false },
      { dayIndex: 5, name: 'Fri', full: 'Friday', count: 0, revenue: 0, isWeekend: false },
      { dayIndex: 6, name: 'Sat', full: 'Saturday', count: 0, revenue: 0, isWeekend: true },
      { dayIndex: 0, name: 'Sun', full: 'Sunday', count: 0, revenue: 0, isWeekend: true },
    ];

    filteredSales.forEach((s) => {
      const d = new Date(s.created_at);
      const day = d.getDay();
      const match = days.find((item) => item.dayIndex === day);
      if (match) {
        match.count += 1;
        match.revenue += s.total;
      }
    });

    const maxDayCount = Math.max(...days.map((d) => d.count), 0);
    const weekendRevenue = days.filter((d) => d.isWeekend).reduce((sum, d) => sum + d.revenue, 0);
    const weekdayRevenue = days.filter((d) => !d.isWeekend).reduce((sum, d) => sum + d.revenue, 0);

    return {
      days,
      maxDayCount,
      weekendRevenue,
      weekdayRevenue,
    };
  }, [filteredSales]);

  // =========================================================================
  // 3. CATEGORY PERFORMANCE
  // =========================================================================
  const categoryStats = useMemo(() => {
    const catMap: Record<string, { category: string; count: number; revenue: number }> = {};

    filteredSales.forEach((s) => {
      (s.items || []).forEach((it: any) => {
        const rawName = (it.item_name || '').toLowerCase();
        let cat = 'Sneakers';
        if (rawName.includes('formal')) cat = 'Formal Shoes';
        else if (rawName.includes('slipper') || rawName.includes('chappal') || rawName.includes('hawai')) cat = 'Slippers / Chappals';
        else if (rawName.includes('sandal')) cat = 'Sandals';
        else if (rawName.includes('casual')) cat = 'Casual Shoes';
        else if (rawName.includes('boot')) cat = 'Boots';
        else if (rawName.includes('kid')) cat = 'Kids Footwear';

        if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, revenue: 0 };
        const qty = Number(it.quantity) || 1;
        catMap[cat].count += qty;
        catMap[cat].revenue += (Number(it.unit_price) || 0) * qty;
      });
    });

    return Object.values(catMap).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // =========================================================================
  // 4. SWEET SPOT PRICE BANDS
  // =========================================================================
  const priceBandStats = useMemo(() => {
    const bands = [
      { label: 'Budget (< ₹500)', min: 0, max: 500, count: 0, revenue: 0 },
      { label: 'Popular (₹500 - ₹999)', min: 500, max: 1000, count: 0, revenue: 0 },
      { label: 'Premium (₹1,000 - ₹1,999)', min: 1000, max: 2000, count: 0, revenue: 0 },
      { label: 'Luxury (₹2,000+)', min: 2000, max: 999999, count: 0, revenue: 0 },
    ];

    filteredSales.forEach((s) => {
      const match = bands.find((b) => s.total >= b.min && s.total < b.max);
      if (match) {
        match.count += 1;
        match.revenue += s.total;
      }
    });

    const total = filteredSales.length || 1;
    return bands.map((b) => ({
      ...b,
      sharePct: filteredSales.length > 0 ? Math.round((b.count / total) * 100) : 0,
    }));
  }, [filteredSales]);

  // =========================================================================
  // 5. PAYMENT BREAKDOWN (Cash vs UPI vs Udhar)
  // =========================================================================
  const paymentBreakdown = useMemo(() => {
    const total = totalRevenue || 1;
    const cash = filteredSales.reduce((sum, s) => sum + (s.cash_amount || 0), 0);
    const online = filteredSales.reduce((sum, s) => sum + (s.online_amount || 0), 0);
    const due = filteredSales.reduce((sum, s) => sum + (s.due_amount || 0), 0);

    return {
      cash,
      cashPct: totalRevenue > 0 ? Math.round((cash / total) * 100) : 0,
      online,
      onlinePct: totalRevenue > 0 ? Math.round((online / total) * 100) : 0,
      due,
      duePct: totalRevenue > 0 ? Math.round((due / total) * 100) : 0,
    };
  }, [filteredSales, totalRevenue]);

  // =========================================================================
  // 6. STAFF / SALESPERSON PERFORMANCE BREAKDOWN
  // =========================================================================
  const staffPerformance = useMemo(() => {
    const map: Record<string, { name: string; billsCount: number; totalSales: number }> = {};

    filteredSales.forEach((s) => {
      const name = s.created_by_name?.trim() || 'Counter Staff';
      if (!map[name]) {
        map[name] = { name, billsCount: 0, totalSales: 0 };
      }
      map[name].billsCount += 1;
      map[name].totalSales += s.total;
    });

    return Object.values(map).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredSales]);

  const dateFilterLabels: Record<string, string> = {
    today: 'Today',
    this_week: 'Past 7 Days',
    this_month: 'This Month',
    all_time: 'All Time',
  };

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm my-12 font-sans">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-900">Admin Only Access</h3>
        <p className="text-xs text-slate-500">
          Business scaling analytics and store financial intelligence are restricted to Store Admins.
        </p>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="analytics:view">
      <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans px-3 sm:px-6 py-4">
        {/* BACK TO MORE HUB NAVIGATION */}
        <div className="flex items-center justify-between">
          <Link
            to="/app/more"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200/90 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>Back</span>
          </Link>
          <span className="text-[11px] font-bold text-slate-400">Admin Analytics</span>
        </div>

        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ff6600]" /> Business Analytics
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {activeShop?.name || 'Zain Footwear'} — size demand, pricing & staff performance
            </p>
          </div>

          {/* PERIOD FILTER PILLS & PRINT */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/90 text-xs font-bold gap-0.5">
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`h-7 px-2.5 rounded-lg transition-all cursor-pointer ${
                  dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('this_week')}
                className={`h-7 px-2.5 rounded-lg transition-all cursor-pointer ${
                  dateFilter === 'this_week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('this_month')}
                className={`h-7 px-2.5 rounded-lg transition-all cursor-pointer ${
                  dateFilter === 'this_month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('all_time')}
                className={`h-7 px-2.5 rounded-lg transition-all cursor-pointer ${
                  dateFilter === 'all_time' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 w-9 flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Print Analytics Report"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* EMPTY STATE BANNER IF NO SALES IN SELECTED PERIOD */}
        {totalOrdersCount === 0 && (
          <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2.5">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                No sales records found for <strong>{dateFilterLabels[dateFilter]}</strong>. Metrics below reflect 0 transactions until POS bills are created.
              </span>
            </div>
            <Link
              to="/app/pos"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-[11px]"
            >
              Open POS
            </Link>
          </div>
        )}

        {/* 4 HEADLINE SCALING METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric 1: Total Revenue */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Total Sales Volume
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] font-bold text-slate-500">
              {totalOrdersCount} bill{totalOrdersCount === 1 ? '' : 's'} recorded
            </p>
          </div>

          {/* Metric 2: Average Order Value (AOV) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Avg. Order Value (AOV)
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#ff6600] font-mono tracking-tight">
              ₹{averageOrderValue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] font-bold text-slate-500">Avg ticket per counter customer</p>
          </div>

          {/* Metric 3: Repeat Customer Rate */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Customer Retention Rate
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight">
              {customerRetentionRate}%
            </p>
            <p className="text-[11px] font-bold text-slate-500">Repeat buyers vs walk-ins</p>
          </div>

          {/* Metric 4: Multi-Item Rate */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Multi-Pair Basket Rate
            </span>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono tracking-tight">
              {multiItemRate}%
            </p>
            <p className="text-[11px] font-bold text-slate-500">Bills with 2+ pairs purchased</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: SHOE SIZE DEMAND & SIZING INTELLIGENCE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>👟 Shoe Size Demand & Sizing Intelligence</span>
              </h2>
              <p className="text-xs text-slate-500">
                Calculates which footwear sizes sell fast based on actual customer receipts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hotSizes.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  <Flame className="w-3 h-3 text-orange-600" /> Hot Movers: UK {hotSizes.join(', ')}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">
                  {totalOrdersCount > 0 ? 'Sizes evenly distributed' : 'Awaiting counter sales'}
                </span>
              )}
            </div>
          </div>

          {/* Smart Recommendation Banner based on real data */}
          {sizeAnalytics.length > 0 ? (
            <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/60 to-yellow-50/40 rounded-2xl p-4 border border-orange-200/70 flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-[#ff6600] text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs">Factory Order Ratio Recommendation</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {hotSizes.length > 0
                    ? `Sizes ${hotSizes.join(', ')} drive the highest retail volume (${sizeAnalytics
                        .filter((s) => s.classification === 'HOT')
                        .reduce((sum, s) => sum + s.sharePct, 0)}% of total demand). In your next purchase order, allocate priority budget to these sizes.`
                    : 'Sales are distributed across multiple sizes. Monitor trends over 30 days to establish factory purchase ratios.'}
                  {slowSizes.length > 0 && (
                    <span className="block mt-1 text-slate-500">
                      ❄️ Slower moving sizes to maintain lean inventory on: <strong>{slowSizes.join(', ')}</strong>.
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No shoe sizes recorded in this period. Create invoices in POS to see live size demand curves.
            </div>
          )}

          {/* Size Visual Bars Grid */}
          {sizeAnalytics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sizeAnalytics.map((item) => (
                <div
                  key={item.size}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.classification === 'HOT'
                      ? 'bg-gradient-to-br from-orange-50/70 to-amber-50/30 border-orange-200/90 shadow-xs'
                      : item.classification === 'SLOW'
                      ? 'bg-slate-50/70 border-slate-200/80'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-base text-slate-900 font-mono">
                          Size UK {item.size}
                        </span>
                        {item.classification === 'HOT' && (
                          <span className="text-[9px] font-black uppercase text-orange-700 bg-orange-100 border border-orange-300 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> Hot Seller
                          </span>
                        )}
                        {item.classification === 'SLOW' && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <Snowflake className="w-2.5 h-2.5 text-slate-400" /> Slow Mover
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                        {item.pairsSold} Pair{item.pairsSold === 1 ? '' : 's'} Sold • ₹
                        {item.revenue.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <span className="text-sm font-black font-mono text-slate-900">{item.sharePct}%</span>
                  </div>

                  {/* Visual Horizontal Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.classification === 'HOT'
                          ? 'bg-[#ff6600]'
                          : item.classification === 'SLOW'
                          ? 'bg-slate-400'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(8, item.sharePct))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: CUSTOMER FOOTFALL TIMING & PEAK HOURS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Customer Footfall & Peak Shopping Hours
              </h2>
              <p className="text-xs text-slate-500">
                Reveals the exact hours customers buy, so you deploy staff during rush hours.
              </p>
            </div>

            {hourlyFootfall.peakHourItem && (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-600" /> Peak Hour:{' '}
                {hourlyFootfall.peakHourItem.timeWindow} ({hourlyFootfall.peakHourItem.count} Bills)
              </span>
            )}
          </div>

          {/* 12-Hour Vertical Bar Histogram (10 AM to 10 PM) */}
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-40 sm:h-48 pt-6 px-1">
              {hourlyFootfall.hours.map((item) => {
                const heightPercent =
                  hourlyFootfall.maxCount > 0 ? Math.round((item.count / hourlyFootfall.maxCount) * 100) : 0;
                const isRushHour = item.hour >= 17 && item.hour <= 20; // 5 PM to 9 PM
                const isPeakSingle = item.hour === hourlyFootfall.peakHourItem?.hour;

                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {item.timeWindow}: {item.count} bills (₹{item.revenue.toLocaleString('en-IN')})
                    </div>

                    {/* Count label above bar */}
                    {item.count > 0 && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono font-black mb-1 ${
                          isPeakSingle ? 'text-orange-600' : 'text-slate-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {/* Bar Pill */}
                    <div
                      className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 ${
                        item.count === 0
                          ? 'bg-slate-100'
                          : isPeakSingle
                          ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-md shadow-orange-500/30'
                          : isRushHour
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                          : 'bg-slate-300 group-hover:bg-slate-400'
                      }`}
                      style={{ height: `${Math.max(item.count > 0 ? 12 : 4, heightPercent)}%` }}
                    />

                    {/* Hour Label */}
                    <span className="text-[10px] font-bold text-slate-500 mt-2 truncate w-full text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timing Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] pt-3 border-t border-slate-100 text-slate-600 font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#ff6600]" /> Peak Rush
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-300" /> Normal Traffic
                </span>
              </div>
              <span className="text-slate-500 font-semibold">
                Store Operating Window: 10:00 AM – 10:00 PM
              </span>
            </div>
          </div>

          {/* DAY-OF-WEEK SURGE */}
          <div className="pt-2">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-3">
              📅 Day of Week Footfall Breakdown
            </h3>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {dayOfWeekStats.days.map((day) => {
                return (
                  <div
                    key={day.name}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      day.count > 0 && day.isWeekend
                        ? 'bg-gradient-to-b from-orange-50 to-amber-50/50 border-orange-200/80 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/70'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-black uppercase block ${
                        day.isWeekend ? 'text-orange-700' : 'text-slate-500'
                      }`}
                    >
                      {day.name}
                    </span>
                    <p className="text-sm sm:text-base font-black font-mono text-slate-900 mt-1">
                      {day.count}
                    </p>
                    <span className="text-[10px] font-bold text-slate-500 block truncate font-mono">
                      ₹{Math.round(day.revenue / 1000)}k
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: CATEGORY PERFORMANCE & SWEET-SPOT PRICING */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Category Share */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" /> Category Volume & Revenue
            </h3>

            <div className="space-y-3">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No category sales recorded in this period.</p>
              ) : (
                categoryStats.map((cat) => {
                  const sharePct = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800">{cat.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500">{cat.count} pairs</span>
                          <span className="font-mono text-slate-900">₹{cat.revenue.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] font-mono text-slate-400">({sharePct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.max(5, sharePct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sweet Spot Price Bands */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" /> Price-Band Distribution
            </h3>

            <div className="space-y-3">
              {priceBandStats.map((band) => (
                <div key={band.label} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-900">{band.label}</span>
                    <span className="font-mono font-black text-slate-900">
                      {band.count} bills ({band.sharePct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#ff6600] rounded-full"
                      style={{ width: `${Math.max(band.count > 0 ? 6 : 0, band.sharePct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 font-medium">
              💡 <strong>Counter Insight:</strong> Footwear priced between ₹500 – ₹1,499 generates the fastest counter turnover.
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: PAYMENT SPLIT & STAFF COUNTER PERFORMANCE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Payment Modes */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Payment Settlement Breakdown
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">Cash</span>
                <p className="text-base font-black font-mono text-emerald-950 mt-1">₹{paymentBreakdown.cash.toLocaleString('en-IN')}</p>
                <span className="text-[10px] font-bold text-emerald-600">{paymentBreakdown.cashPct}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-black uppercase text-blue-800 block">UPI / Online</span>
                <p className="text-base font-black font-mono text-blue-950 mt-1">₹{paymentBreakdown.online.toLocaleString('en-IN')}</p>
                <span className="text-[10px] font-bold text-blue-600">{paymentBreakdown.onlinePct}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-black uppercase text-amber-800 block">Customer Due</span>
                <p className="text-base font-black font-mono text-amber-950 mt-1">₹{paymentBreakdown.due.toLocaleString('en-IN')}</p>
                <span className="text-[10px] font-bold text-amber-600">{paymentBreakdown.duePct}%</span>
              </div>
            </div>
          </div>

          {/* Sales Staff Performance */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" /> Sales Staff Performance
            </h3>

            <div className="space-y-2.5">
              {staffPerformance.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No sales attributed to staff in this period.</p>
              ) : (
                staffPerformance.map((staff) => (
                  <div key={staff.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 font-black flex items-center justify-center text-xs">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 block">{staff.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{staff.billsCount} bills processed</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      ₹{staff.totalSales.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default AdminAnalyticsPage;
