import React from 'react';
import { Lightbulb, Edit3, Type, Image as ImageIcon, PenTool } from 'lucide-react';

const SuggestionCard = ({ title, icon: Icon, content, color }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {content}
                </div>
            </div>
        </div>
    </div>
);

const ActionSuggestions = ({ suggestions }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                AI Action Plan
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
                {suggestions.suggestedHookRewrite && (
                    <SuggestionCard
                        title="Hook Rewrite"
                        icon={PenTool}
                        content={suggestions.suggestedHookRewrite}
                        color="bg-blue-500"
                    />
                )}

                {suggestions.suggestedCTARewrite && (
                    <SuggestionCard
                        title="Call to Action (CTA)"
                        icon={MessageCircle}
                        content={suggestions.suggestedCTARewrite}
                        color="bg-purple-500"
                    />
                )}

                {suggestions.suggestedEdits && (
                    <SuggestionCard
                        title="Editing Suggestions"
                        icon={Edit3}
                        content={suggestions.suggestedEdits}
                        color="bg-pink-500"
                    />
                )}

                {suggestions.thumbnailIdeas && (
                    <SuggestionCard
                        title="Thumbnail Ideas"
                        icon={ImageIcon}
                        content={suggestions.thumbnailIdeas}
                        color="bg-amber-500"
                    />
                )}

                {suggestions.subtitleImprovements && (
                    <SuggestionCard
                        title="Subtitle Improvements"
                        icon={Type}
                        content={suggestions.subtitleImprovements}
                        color="bg-emerald-500"
                    />
                )}
            </div>
        </div>
    );
};

// Helper for icon import
import { MessageCircle } from 'lucide-react';

export default ActionSuggestions;
