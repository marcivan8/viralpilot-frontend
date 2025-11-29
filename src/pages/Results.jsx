import React from 'react';
import Navigation from '../components/Navigation';
import VideoPreview from '../components/VideoPreview';
import ViralScores from '../components/ViralScores';
import RetentionHeatmap from '../components/RetentionHeatmap';
import ActionSuggestions from '../components/ActionSuggestions';
import Highlights from '../components/Highlights';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

const Results = ({ results, videoFile, onBack, onLogin }) => {
    console.log('📊 Results Page Received Data:', results);
    if (!results) return null;

    const videoUrl = videoFile ? URL.createObjectURL(videoFile) : null;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            <Navigation onLogin={onLogin} />

            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Analyze Another Video
                    </button>

                    <div className="flex gap-3">
                        <button className="btn btn-secondary gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button className="btn btn-primary gap-2">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column - Video & Key Metrics */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            <div className="card p-1 bg-white shadow-xl">
                                <VideoPreview videoUrl={videoUrl} />
                            </div>

                            <ViralScores
                                scores={results.scores}
                                platformScores={results.platformScores}
                            />
                        </div>
                    </div>

                    {/* Right Column - Deep Analysis */}
                    <div className="lg:col-span-8 space-y-8">
                        <RetentionHeatmap data={results.retentionHeatmap} />

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <ActionSuggestions suggestions={results} />
                            </div>
                        </div>

                        <Highlights highlights={results.bestHighlights} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Results;
