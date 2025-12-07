import React, { useState } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="btn btn-primary px-6 py-2">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TermsOfService = ({ isOpen, onClose }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service">
        <div className="prose prose-sm max-w-none text-gray-600">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Introduction</h3>
            <p className="mb-4">Welcome to ViralPilot. By using our services, you agree to these terms.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Usage</h3>
            <p className="mb-4">You agree to use our video analysis tools responsibly. Do not upload illegal or prohibited content.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Service Availability</h3>
            <p className="mb-4">We strive for 99% uptime but cannot guarantee uninterrupted access.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4. User Accounts</h3>
            <p className="mb-4">You are responsible for maintaining the confidentiality of your account credentials.</p>
        </div>
    </Modal>
);

export const PrivacyPolicy = ({ isOpen, onClose }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy">
        <div className="prose prose-sm max-w-none text-gray-600">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Data Collection</h3>
            <p className="mb-4">We collect your email and usage data to improve our services. We do not sell your personal data.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Video Analysis</h3>
            <p className="mb-4">Videos uploaded for analysis are processed by our AI and third-party providers (e.g. Google Cloud Vision). We do not permanently store your video files without permission.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Cookies</h3>
            <p className="mb-4">We use cookies to maintain your session and preferences.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Your Rights</h3>
            <p className="mb-4">You have the right to request deletion of your data at any time (GDPR compliance).</p>
        </div>
    </Modal>
);
