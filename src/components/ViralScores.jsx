import React from 'react';
import { TrendingUp, Activity, Heart, Zap, MessageCircle } from 'lucide-react';

const CircularProgress = ({ score, label, color, icon: Icon }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center group">
            <div className="relative w-24 h-24 mb-3 transition-transform duration-300 group-hover:scale-110">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${color} transition-all duration-1000 ease-out`}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${color.replace('text-', 'text-')}`}>
                        {score}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-600 font-medium text-sm">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </div>
        </div>
    );
};

const PlatformScore = ({ platform, score }) => {
    const getPlatformColor = (p) => {
        switch (p.toLowerCase()) {
            case 'tiktok': return 'bg-black text-white';
            case 'youtube': return 'bg-red-600 text-white';
            case 'instagram': return 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white';
            case 'shorts': return 'bg-red-600 text-white';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4 hover:border-brand-200 transition-colors">
            <div className="flex items-center gap-3 min-w-0 w-1/3">
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${getPlatformColor(platform)}`}>
                    {platform[0]}
                </div>
                <span className="font-semibold text-gray-700 truncate">{platform}</span>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-2.5 w-full max-w-[120px] bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${score}%` }}
                    />
                </div>
                <span className="font-bold text-gray-900 w-9 text-right">{score}</span>
            </div>
        </div>
    );
};

const ViralScores = ({ scores, platformScores }) => {
    if (!scores || !platformScores) {
        console.warn('ViralScores: Missing data', { scores, platformScores });
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Main Viral Score */}
            <div className="card p-8 text-center bg-gradient-to-b from-white to-brand-50/30">
                <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-6">
                    Overall Viral Potential
                </h3>
                <div className="relative inline-block">
                    <div className="w-48 h-48 rounded-full border-8 border-gray-100 flex items-center justify-center bg-white shadow-inner">
                        <div className="text-center">
                            <span className="block text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
                                {scores.viralityScore}
                            </span>
                            <span className="text-sm text-gray-400 font-medium mt-1">OUT OF 100</span>
                        </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-100 animate-bounce">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-500" />
                    Detailed Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <CircularProgress
                        score={scores.hookScore}
                        label="Hook"
                        color="text-blue-500"
                        icon={Zap}
                    />
                    <CircularProgress
                        score={scores.pacingScore}
                        label="Pacing"
                        color="text-purple-500"
                        icon={Activity}
                    />
                    <CircularProgress
                        score={scores.emotionScore}
                        label="Emotion"
                        color="text-pink-500"
                        icon={Heart}
                    />
                    <CircularProgress
                        score={scores.storytellingScore}
                        label="Story"
                        color="text-amber-500"
                        icon={MessageCircle}
                    />
                    <CircularProgress
                        score={scores.clarityScore}
                        label="Clarity"
                        color="text-emerald-500"
                        icon={CheckCircle2}
                    />
                </div>
            </div>

            {/* Platform Scores */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Fit</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(platformScores).map(([platform, score]) => (
                        <PlatformScore key={platform} platform={platform} score={score} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper for icon import in CircularProgress
import { CheckCircle2 } from 'lucide-react';

export default ViralScores;
