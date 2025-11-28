import React from 'react';
import { Sparkles, PlayCircle, Clock } from 'lucide-react';

const Highlights = ({ highlights, onPlayHighlight }) => {
    if (!highlights || highlights.length === 0) return null;

    return (
        <div className="card p-6 bg-gradient-to-br from-brand-50/50 to-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                Viral Highlights
            </h3>

            <div className="space-y-3">
                {highlights.map((highlight, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group cursor-pointer"
                        onClick={() => onPlayHighlight && onPlayHighlight(highlight.start)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                <PlayCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{highlight.description || `Highlight #${index + 1}`}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{highlight.start}s - {highlight.end}s</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {highlight.score}/100 Impact
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Highlights;
