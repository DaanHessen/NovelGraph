import { Input, InputProps } from '@/app/_components/ui/Input';
import { cn } from '@/app/lib/utils';
import { forwardRef } from 'react';

export const SettingsInput = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <Input 
                ref={ref}
                className={cn(
                    "bg-white/5 border border-white/10 focus:border-accent/50 focus:bg-accent/5 transition-colors placeholder:text-muted-foreground/50",
                    className
                )}
                {...props}
            />
        );
    }
);

SettingsInput.displayName = "SettingsInput";
