import { twMerge } from 'tailwind-merge';

interface LogoProps {
    className?: string;
}

export const Logo = ({ className }: LogoProps) => {
    return (
        <div className={twMerge("w-8 h-8 bg-accent rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-accent/20", className)}>
            <span className="font-bold text-lg text-white select-none">TS</span>
        </div>
    );
};
