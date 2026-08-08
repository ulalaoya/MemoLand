import type { LandId } from '../types';

export interface LandVisualTheme {
  id: LandId;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  cardBorder: string;
  checkpoint: string;
  route: string;
  glow: string;
  motif: 'numbers' | 'echo' | 'image' | 'pattern' | 'speed' | 'treasure';
}

export const LAND_THEMES: Record<LandId, LandVisualTheme> = {
  numbers: {
    id: 'numbers', primary: '#2E8DF6', secondary: '#58C548', accent: '#FFC928', background: '#CFF2FF',
    surface: '#F4FCFF', cardBorder: '#2E8DF6', checkpoint: '#FFC928', route: '#D99A3A',
    glow: 'rgba(46, 141, 246, 0.28)', motif: 'numbers',
  },
  echoes: {
    id: 'echoes', primary: '#5267D9', secondary: '#8C52D9', accent: '#67C8FF', background: '#252858',
    surface: '#F3F0FF', cardBorder: '#675BD8', checkpoint: '#67C8FF', route: '#7C63CF',
    glow: 'rgba(103, 200, 255, 0.34)', motif: 'echo',
  },
  forest: {
    id: 'forest', primary: '#3CAA4A', secondary: '#58C548', accent: '#FFC928', background: '#DDF6C8',
    surface: '#F4FFF0', cardBorder: '#3CAA4A', checkpoint: '#91E35D', route: '#8D5B36',
    glow: 'rgba(88, 197, 72, 0.3)', motif: 'image',
  },
  patterns: {
    id: 'patterns', primary: '#8C52D9', secondary: '#5267D9', accent: '#F04A3A', background: '#E5D9FA',
    surface: '#FBF8FF', cardBorder: '#8C52D9', checkpoint: '#C8A7F4', route: '#6F49B6',
    glow: 'rgba(140, 82, 217, 0.3)', motif: 'pattern',
  },
  speed: {
    id: 'speed', primary: '#F59D2A', secondary: '#2E8DF6', accent: '#F04A3A', background: '#DFF3FF',
    surface: '#FFF8EC', cardBorder: '#F59D2A', checkpoint: '#FFC928', route: '#5267D9',
    glow: 'rgba(245, 157, 42, 0.32)', motif: 'speed',
  },
  castle: {
    id: 'castle', primary: '#6940B7', secondary: '#8C52D9', accent: '#FFC928', background: '#34295D',
    surface: '#FFF9E9', cardBorder: '#E7A61A', checkpoint: '#FFC928', route: '#D39B2C',
    glow: 'rgba(255, 201, 40, 0.34)', motif: 'treasure',
  },
};

export function landTheme(landId: LandId): LandVisualTheme {
  return LAND_THEMES[landId];
}
