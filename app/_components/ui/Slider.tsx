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
        return (
            <div className={`relative flex items-center w-full h-8 touch-none select-none ${className}`}>
                 <input 
                    type="range" 
                    min={min} 
                    max={max} 
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="flex-1 w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary hover:[&::-webkit-slider-thumb]:bg-primary/90 transition-all focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Slider.displayName = 'Slider';

export { Slider };
