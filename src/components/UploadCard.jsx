import React, { useState, useRef } from 'react';
import { Upload, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react';

const UploadCard = ({ onFileSelect, disabled }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file) => {
        if (!file.type.startsWith('video/')) {
            alert("Please upload a video file");
            return;
        }
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            alert("File too large. Maximum size is 100MB");
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div
            className={`relative group cursor-pointer transition-all duration-300 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleChange}
                disabled={disabled}
            />

            <div className={`
        relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300
        ${dragActive
                    ? 'border-brand-500 bg-brand-50 scale-[1.02]'
                    : selectedFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-brand-400 hover:bg-gray-50'
                }
      `}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                    {selectedFile ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Video Selected
                                </h3>
                                <p className="text-sm text-gray-500 max-w-[200px] truncate mx-auto">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                            </div>
                            <button
                                onClick={clearFile}
                                className="mt-2 text-sm font-medium text-red-500 hover:text-red-700 hover:underline px-3 py-1"
                            >
                                Remove
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mb-2 transition-colors duration-300
                ${dragActive ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500'}
              `}>
                                <Upload className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                                    {dragActive ? "Drop video here" : "Upload your video"}
                                </h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                                    Drag and drop your video file here, or click to browse your files.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1">
                                    <FileVideo className="w-3 h-3" /> MP4, MOV, AVI
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>Up to 100MB</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadCard;
