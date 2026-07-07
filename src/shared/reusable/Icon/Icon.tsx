import {
  Heart, Gift, Home, Sparkles, Gem, Briefcase, Users, FileText,
  ShieldCheck, Eye, Calendar, Star, TrendingUp, BadgeCheck,
  type LucideIcon,
} from 'lucide-react';

/**
 * Stateless icon primitive. Components reference a stable IconKey from our
 * domain instead of importing lucide directly — so the icon library is an
 * implementation detail we can swap in one place (dependency inversion).
 */
export type IconKey =
  | 'heart' | 'gift' | 'home' | 'sparkles' | 'rings' | 'briefcase'
  | 'users' | 'file-text' | 'shield-check' | 'eye' | 'calendar'
  | 'star' | 'trending-up' | 'badge-check';

const REGISTRY: Record<IconKey, LucideIcon> = {
  heart: Heart, gift: Gift, home: Home, sparkles: Sparkles, rings: Gem,
  briefcase: Briefcase, users: Users, 'file-text': FileText,
  'shield-check': ShieldCheck, eye: Eye, calendar: Calendar, star: Star,
  'trending-up': TrendingUp, 'badge-check': BadgeCheck,
};

export interface IconProps {
  name: IconKey;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

export function Icon({ name, size = 20, strokeWidth = 2, className, ...rest }: IconProps) {
  const Cmp = REGISTRY[name];
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden {...rest} />;
}
