import React from 'react';
import Navigation from '../components/Navigation';
import UploadCard from '../components/UploadCard';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

const Home = ({ onFileSelect, isAnalyzing }) => {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-50/50 to-transparent" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-40 -left-20 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl animate-pulse-slow delay-1000" />
            </div>

            <Navigation />

            <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-100 shadow-sm mb-8 animate-float">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                        <span className="text-sm font-medium text-gray-600">AI-Powered Viral Prediction</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6 tracking-tight">
                        Make Your Content <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
                            Go Viral
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Upload your video and get instant AI analysis on retention,
                        emotional impact, and viral potential.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-accent-500 rounded-[2rem] blur opacity-20 animate-pulse" />
                    <div className="relative bg-white rounded-[1.8rem] shadow-2xl shadow-brand-500/10 p-2">
                        <UploadCard onFileSelect={onFileSelect} disabled={isAnalyzing} />
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-24">
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Instant Scoring</h3>
                        <p className="text-gray-600">Get a comprehensive viral score based on millions of data points.</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Retention Heatmap</h3>
                        <p className="text-gray-600">See exactly where viewers drop off and how to fix it.</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-4">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">AI Suggestions</h3>
                        <p className="text-gray-600">Actionable tips to improve hooks, pacing, and storytelling.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
