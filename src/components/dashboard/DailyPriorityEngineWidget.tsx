import React from 'react';
import { useNavigate } from 'react-router-dom';
import { staffWorkService } from '../../services/staffWorkService';
import { PriorityItem } from '../../types/database.types';
import { ArrowRight } from 'lucide-react';

export const DailyPriorityEngineWidget: React.FC = () => {
  const navigate = useNavigate();
  const priorities: PriorityItem[] = staffWorkService.getDailyPriorityEngine();

  return (
    <div className="bg-white border border-[#e1e3e5] rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Deterministic Daily Priority Engine
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Footwear Ops Queue</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">Actionable Store Priorities</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 font-mono">{priorities.length} Action Items</span>
      </div>

      <div className="space-y-3">
        {priorities.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.target_link)}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold font-mono text-xs flex items-center justify-center flex-shrink-0">
                #{item.rank}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm group-hover:text-[#008060] transition-colors">
                    {item.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      item.urgency === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : item.urgency === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{item.details}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-[#008060] group-hover:translate-x-0.5 transition-transform">
              <span>Action Record</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
