import React, { forwardRef } from 'react';
import { Play } from 'lucide-react';

const VideoPreview = forwardRef(({ videoUrl, poster }, ref) => {
    if (!videoUrl) return null;

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-[9/16] max-w-sm mx-auto border-4 border-gray-900">
            <video
                ref={ref}
                src={videoUrl}
                poster={poster}
                controls
                className="w-full h-full object-cover"
                playsInline
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
});

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;
