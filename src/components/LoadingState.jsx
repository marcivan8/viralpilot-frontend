import React from 'react';
import { Plane, Sparkles } from 'lucide-react';

const LoadingState = ({ progress, status }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-brand-100 rounded-full animate-pulse-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Plane className="w-16 h-16 text-brand-600 animate-float" />
                </div>
                <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-accent-500 animate-bounce" />
                </div>
            </div>

            <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                Analyzing Your Video
            </h3>

            <p className="text-gray-500 mb-8 max-w-md text-center px-4">
                {status || "AI is extracting viral insights, analyzing retention, and generating scores..."}
            </p>

            <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="mt-2 text-sm font-medium text-brand-600">
                {progress}% Complete
            </div>
        </div>
    );
};

export default LoadingState;
