export default function Logo({ className }: { className?: string }) {
  return (
    <pre className={`font-mono text-[5px] leading-[5px] text-accent/90 font-black tracking-tighter select-none pointer-events-none drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)] ${className}`}>
{`███    ██  ██████  
████   ██ ██       
██ ██  ██ ██   ███ 
██  ██ ██ ██    ██ 
██   ████  ██████`}
    </pre>
  );
}
