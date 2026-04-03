import { cn } from '@/lib/utils';

interface FighterCardProps {
  name: string;
  nickname?: string;
  image: string;
  record: string;
  odds: string;
  corner: 'red' | 'blue';
  selected: boolean;
  onSelect: () => void;
}

export function FighterCard({ name, nickname, image, record, odds, corner, selected, onSelect }: FighterCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
        selected
          ? corner === 'red'
            ? "border-primary glow-red bg-primary/5"
            : "border-accent glow-gold bg-accent/5"
          : "border-border hover:border-muted-foreground/50 bg-card"
      )}
    >
      <div className="relative w-40 h-52 md:w-56 md:h-72 overflow-hidden rounded-lg mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          width={224}
          height={288}
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
        )} />
      </div>
      {nickname && (
        <span className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{nickname}</span>
      )}
      <h3 className="font-display text-2xl md:text-3xl tracking-wider">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{record}</p>
      <div className={cn(
        "mt-3 px-4 py-2 rounded-lg font-display text-2xl tracking-wider",
        corner === 'red' ? "bg-primary/20 text-primary" : "bg-accent/20 text-gold"
      )}>
        {odds}
      </div>
      {selected && (
        <span className="mt-2 text-xs uppercase tracking-widest text-foreground font-semibold">
          ✓ Selected
        </span>
      )}
    </button>
  );
}
