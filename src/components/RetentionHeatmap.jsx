import React from 'react';
import { BarChart2, Info } from 'lucide-react';

const RetentionHeatmap = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Normalize data for visualization (0-100 height)
    const maxVal = Math.max(...data.map(d => d.retention));
    const normalizedData = data.map(d => ({
        ...d,
        height: (d.retention / maxVal) * 100
    }));

    const getBarColor = (retention) => {
        if (retention >= 80) return 'bg-green-500';
        if (retention >= 50) return 'bg-brand-500';
        if (retention >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-brand-500" />
                    Audience Retention Heatmap
                </h3>
                <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Shows predicted audience retention second-by-second. Green bars indicate high engagement, red bars indicate drop-off points.
                    </div>
                </div>
            </div>

            <div className="relative h-48 flex items-end gap-1 w-full">
                {normalizedData.map((point, index) => (
                    <div
                        key={index}
                        className="flex-1 group relative"
                        style={{ height: `${point.height}%` }}
                    >
                        <div
                            className={`w-full h-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${getBarColor(point.retention)}`}
                        />

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                            <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                {point.timestamp}s: {point.retention}%
                            </div>
                        </div>
                    </div>
                ))}

                {/* Baseline */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                <span>0:00</span>
                <span>Video Duration</span>
            </div>
        </div>
    );
};

export default RetentionHeatmap;
