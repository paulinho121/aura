

export interface UserProfile {
  id: string;
  name: string;
  portraitUrl: string; // AI generated symbolic portrait
  vibe: string;
  pulseCount: number;
  lastPulseAt: number | null;
  seedCount: number; // Invites available
  communityCount: number; // For future community building
  color?: string; // Dominant ethereal color
}


export interface Pulse {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl: string;
  timestamp: number;
  energy: number; // A dynamic value representing "resonance"
  resonanceCount: number; // Likes/Resonances received
  color?: string;
  frequency?: number;
  heartRate?: number; // Captured during ritual
}

export type ViewState = 'NEBULA' | 'RITUAL' | 'PROFILE' | 'SEED' | 'INTRO' | 'COMMUNITIES' | 'IDENTITY';

export enum ResonanceType {
  HARMONY = 'HARMONY',
  VOID = 'VOID',
  PULSE = 'PULSE'
}
