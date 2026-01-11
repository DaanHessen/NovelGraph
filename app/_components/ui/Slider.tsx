'use client';

import * as React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, onChange, min = 0, max = 100, step = 1, ...props }, ref) => {
        // Calculate percentage for the gradient background to simulate a fill track
        const percentage = ((value - min) / (max - min)) * 100;

        return (
            <div className={`relative flex items-center w-full h-8 touch-none select-none ${className}`}>
                 <input 
                    type="range" 
                    min={min} 
                    max={max} 
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    style={{
                        background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--secondary) ${percentage}%, var(--secondary) 100%)`
                    }}
                    className="flex-1 w-full h-1.5 rounded-full appearance-none cursor-pointer 
                        bg-secondary 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-foreground 
                        [&::-webkit-slider-thumb]:shadow-lg 
                        [&::-webkit-slider-thumb]:transition-all 
                        [&::-webkit-slider-thumb]:border-none 
                        hover:[&::-webkit-slider-thumb]:scale-110 
                        focus-visible:outline-none 
                        focus:ring-2 focus:ring-accent focus:ring-offset-background  focus:ring-offset-2"
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Slider.displayName = 'Slider';

export { Slider };
