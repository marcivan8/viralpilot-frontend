import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { PrivacyPolicy } from './LegalDocs';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('viral_pilot_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('viral_pilot_cookie_consent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('viral_pilot_cookie_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-slide-up">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-brand-100 rounded-full text-brand-600 hidden md:block">
                            <Cookie className="w-6 h-6" />
                        </div>
                        <div className="text-sm text-gray-600">
                            <p className="font-semibold text-gray-900 mb-1">We value your privacy</p>
                            <p>
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                                By clicking "Accept", you consent to our use of cookies.
                                Read our{' '}
                                <button
                                    onClick={() => setShowPrivacy(true)}
                                    className="text-brand-600 hover:text-brand-700 underline font-medium"
                                >
                                    Privacy Policy
                                </button>
                                .
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleDecline}
                            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 md:flex-none px-6 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            </div>

            <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </>
    );
};

export default CookieConsent;
