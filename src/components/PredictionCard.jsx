import React from 'react';
import { TrendingUp, Award, Eye } from 'lucide-react';

const PredictionCard = ({ prediction }) => {
    if (!prediction) return null;

    const { views, assessment, viralityScore } = prediction;

    // Format views to be more readable (e.g. 1.2M, 500k)
    const formatViews = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    const getAssessmentColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const assessmentColorClass = getAssessmentColor(viralityScore);

    return (
        <div className="card bg-white p-6 shadow-sm border border-slate-100 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Viral Prediction</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Predicted Views */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                        <Eye className="w-4 h-4" /> Predicted Views
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                        {formatViews(views)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        Estimated reach
                    </div>
                </div>

                {/* Assessment */}
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${assessmentColorClass}`}>
                    <div className="text-sm font-medium mb-1 flex items-center gap-1 opacity-80">
                        <Award className="w-4 h-4" /> Assessment
                    </div>
                    <div className="text-xl font-bold">
                        {assessment}
                    </div>
                    <div className="text-xs mt-1 opacity-70">
                        Based on virality score
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictionCard;
