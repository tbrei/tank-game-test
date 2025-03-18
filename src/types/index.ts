export interface Position {
  x: number;
  y: number;
}

export interface Tank {
  id: string;
  position: Position;
  chassisAngle: number;
  turretAngle: number;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  lastShotTime: number;
  speed: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  isAlive: boolean;
  respawnTime: number;
  lastDeathTime: number;
  kills: number;
  deaths: number;
}

export interface Bullet {
  id: string;
  position: Position;
  angle: number;
  speed: number;
  damage: number;
  tankId: string;
  width: number;
  height: number;
}

export interface Obstacle {
  position: Position;
  width: number;
  height: number;
}

export interface GameState {
  tanks: Record<string, Tank>;
  bullets: Record<string, Bullet>;
  obstacles: Obstacle[];
  gameStarted: boolean;
  gamePaused: boolean;
}

export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  turretLeft: boolean;
  turretRight: boolean;
}

export interface Player {
  id: string;
  controls: Controls;
  color: string;
}

export type CollisionType = 'tank-tank' | 'tank-bullet' | 'tank-obstacle' | 'bullet-obstacle';
