import React from 'react';
import { Sparkles, AlertCircle, Clock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RateLimitAlertProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RateLimitAlert: React.FC<RateLimitAlertProps> = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-slate-900 dark:to-slate-800 shadow-2xl overflow-hidden glassmorphism">

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>

                <DialogHeader className="pt-6 px-6 relative z-10 space-y-4">
                    <div className="mx-auto bg-white dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center shadow-md ring-4 ring-purple-100 dark:ring-purple-900/30 mb-4 transition-transform hover:scale-105 duration-300">
                        <AlertCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <DialogTitle className="text-2xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-outfit">
                        Daily Limit Reached
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-sm mx-auto">
                        You've explored all <span className="font-semibold text-purple-700 dark:text-purple-300">5 of your free AI generations</span> for today. Keep up the great energy!
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 relative z-10">
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 flex items-start gap-4 shadow-sm border border-purple-100/50 dark:border-purple-900/20">
                        <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            Your generations will automatically reset at midnight. Come back tomorrow to continue building your perfect routine!
                        </p>
                    </div>
                </div>

                <DialogFooter className="px-6 pb-6 pt-2 sm:justify-center relative z-10 w-full flex-col sm:flex-row gap-3">
                    <Button
                        onClick={onClose}
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 hover:from-indigo-700 to-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 py-2 text-md font-medium group"
                    >
                        Got it, thanks!
                        <Sparkles className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:animate-pulse" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
