import React from 'react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navigation = () => {
    const { user, signOut } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Logo size="sm" />
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                    <User className="w-4 h-4" />
                                    <span className="truncate max-w-[150px]">{user.email}</span>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <div className="text-sm font-medium text-gray-500">
                                Guest Mode
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
