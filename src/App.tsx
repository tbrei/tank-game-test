import React, { useState, useEffect } from 'react';
import './App.css';
import Game from './components/Game';
import { GameState, Tank, Obstacle, Player } from './types';
import { useGameLoop, useKeyboardControls, useAssetLoader, useCollisionDetection } from './hooks/useGameHooks';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TANK_WIDTH = 60;
const TANK_HEIGHT = 80;
const BULLET_SPEED = 300;
const BULLET_SIZE = 5;
const BULLET_DAMAGE = 20;
const TANK_SPEED = 150;
const TANK_ROTATION_SPEED = 3;
const TURRET_ROTATION_SPEED = 4;
const TANK_MAX_HEALTH = 100;
const TANK_MAX_AMMO = 5;
const TANK_RELOAD_TIME = 1; // seconds
const TANK_RESPAWN_TIME = 3; // seconds

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    tanks: {},
    bullets: {},
    obstacles: [],
    gameStarted: false,
    gamePaused: false,
  });

  const [players] = useState<Player[]>([
    { id: '1', controls: { up: false, down: false, left: false, right: false, shoot: false, turretLeft: false, turretRight: false }, color: '#3498db' },
    { id: '2', controls: { up: false, down: false, left: false, right: false, shoot: false, turretLeft: false, turretRight: false }, color: '#e74c3c' },
  ]);

  const { assets, assetsLoaded, loadAssets } = useAssetLoader();
  const playerControls = useKeyboardControls(players);
  const { 
    checkTankObstacleCollision, 
    checkTankTankCollision, 
    checkBulletTankCollision, 
    checkBulletObstacleCollision 
  } = useCollisionDetection();

  // Initialize game state
  useEffect(() => {
    // Load assets
    loadAssets({
      chassis: '/Tank_Chassis.png',
      turret: '/Tank_Turret.png',
    });

    // Create obstacles
    const obstacles: Obstacle[] = [
      { position: { x: 100, y: 100 }, width: 50, height: 50 },
      { position: { x: 650, y: 100 }, width: 50, height: 50 },
      { position: { x: 100, y: 450 }, width: 50, height: 50 },
      { position: { x: 650, y: 450 }, width: 50, height: 50 },
      { position: { x: 375, y: 275 }, width: 50, height: 50 },
    ];

    // Create tanks - adjust initial angles to account for the 90-degree rotation fix
    const tanks: Record<string, Tank> = {
      '1': {
        id: '1',
        position: { x: 200, y: 300 },
        chassisAngle: Math.PI/2, // Start facing right (adjusted for 90-degree fix)
        turretAngle: Math.PI/2,  // Start facing right (adjusted for 90-degree fix)
        health: TANK_MAX_HEALTH,
        maxHealth: TANK_MAX_HEALTH,
        ammo: TANK_MAX_AMMO,
        maxAmmo: TANK_MAX_AMMO,
        reloadTime: TANK_RELOAD_TIME,
        lastShotTime: 0,
        speed: TANK_SPEED,
        rotationSpeed: TANK_ROTATION_SPEED,
        width: TANK_WIDTH,
        height: TANK_HEIGHT,
        color: players[0].color,
        isAlive: true,
        respawnTime: TANK_RESPAWN_TIME,
        lastDeathTime: 0,
        kills: 0,
        deaths: 0,
      },
      '2': {
        id: '2',
        position: { x: 600, y: 300 },
        chassisAngle: 3*Math.PI/2, // Start facing left (adjusted for 90-degree fix)
        turretAngle: 3*Math.PI/2,  // Start facing left (adjusted for 90-degree fix)
        health: TANK_MAX_HEALTH,
        maxHealth: TANK_MAX_HEALTH,
        ammo: TANK_MAX_AMMO,
        maxAmmo: TANK_MAX_AMMO,
        reloadTime: TANK_RELOAD_TIME,
        lastShotTime: 0,
        speed: TANK_SPEED,
        rotationSpeed: TANK_ROTATION_SPEED,
        width: TANK_WIDTH,
        height: TANK_HEIGHT,
        color: players[1].color,
        isAlive: true,
        respawnTime: TANK_RESPAWN_TIME,
        lastDeathTime: 0,
        kills: 0,
        deaths: 0,
      },
    };

    setGameState({
      ...gameState,
      tanks,
      obstacles,
      gameStarted: true,
    });
  }, []);

  // Update game state based on player controls and game logic
  const updateGame = (deltaTime: number) => {
    if (!gameState.gameStarted || gameState.gamePaused) return;

    // Create a copy of the game state to update
    const newGameState = { ...gameState };
    const currentTime = Date.now() / 1000;

    // Update tanks
    Object.values(newGameState.tanks).forEach((tank) => {
      // Skip if tank is not alive
      if (!tank.isAlive) {
        // Check if it's time to respawn
        if (currentTime - tank.lastDeathTime >= tank.respawnTime) {
          tank.isAlive = true;
          tank.health = tank.maxHealth;
          tank.ammo = tank.maxAmmo;
          
          // Respawn position based on player - adjust angles for 90-degree fix
          if (tank.id === '1') {
            tank.position = { x: 200, y: 300 };
            tank.chassisAngle = Math.PI/2; // Start facing right
            tank.turretAngle = Math.PI/2;  // Start facing right
          } else {
            tank.position = { x: 600, y: 300 };
            tank.chassisAngle = 3*Math.PI/2; // Start facing left
            tank.turretAngle = 3*Math.PI/2;  // Start facing left
          }
        }
        return;
      }

      const controls = playerControls[tank.id];
      if (!controls) return;

      // Store original position to revert if collision occurs
      const originalPosition = { ...tank.position };

      // Rotate chassis
      if (controls.left) {
        tank.chassisAngle -= tank.rotationSpeed * deltaTime;
      }
      if (controls.right) {
        tank.chassisAngle += tank.rotationSpeed * deltaTime;
      }

      // Rotate turret
      if (controls.turretLeft) {
        tank.turretAngle -= TURRET_ROTATION_SPEED * deltaTime;
      }
      if (controls.turretRight) {
        tank.turretAngle += TURRET_ROTATION_SPEED * deltaTime;
      }

      // Move tank
      if (controls.up) {
        tank.position.x += Math.cos(tank.chassisAngle) * tank.speed * deltaTime;
        tank.position.y += Math.sin(tank.chassisAngle) * tank.speed * deltaTime;
      }
      if (controls.down) {
        tank.position.x -= Math.cos(tank.chassisAngle) * tank.speed * deltaTime;
        tank.position.y -= Math.sin(tank.chassisAngle) * tank.speed * deltaTime;
      }

      // Keep tank within canvas bounds
      if (tank.position.x < 0) tank.position.x = 0;
      if (tank.position.y < 0) tank.position.y = 0;
      if (tank.position.x > CANVAS_WIDTH - tank.width) tank.position.x = CANVAS_WIDTH - tank.width;
      if (tank.position.y > CANVAS_HEIGHT - tank.height) tank.position.y = CANVAS_HEIGHT - tank.height;

      // Check for collisions with obstacles
      if (checkTankObstacleCollision(tank, newGameState.obstacles)) {
        // Revert to original position if collision occurs
        tank.position = originalPosition;
      }

      // Check for collisions with other tanks
      Object.values(newGameState.tanks).forEach((otherTank) => {
        if (otherTank.id !== tank.id && otherTank.isAlive) {
          if (checkTankTankCollision(tank, otherTank)) {
            // Revert to original position if collision occurs
            tank.position = originalPosition;
          }
        }
      });

      // Shoot
      if (controls.shoot && tank.ammo > 0 && currentTime - tank.lastShotTime >= tank.reloadTime) {
        // Create a new bullet
        const bulletId = `bullet_${tank.id}_${Date.now()}`;
        const bulletX = tank.position.x + tank.width / 2;
        const bulletY = tank.position.y + tank.height / 2;

        newGameState.bullets[bulletId] = {
          id: bulletId,
          position: { x: bulletX, y: bulletY },
          angle: tank.turretAngle,
          speed: BULLET_SPEED,
          damage: BULLET_DAMAGE,
          tankId: tank.id,
          width: BULLET_SIZE,
          height: BULLET_SIZE,
        };

        // Update tank ammo and last shot time
        tank.ammo--;
        tank.lastShotTime = currentTime;
      }

      // Reload ammo over time
      if (tank.ammo < tank.maxAmmo && currentTime - tank.lastShotTime >= tank.reloadTime) {
        const reloadCount = Math.floor((currentTime - tank.lastShotTime) / tank.reloadTime);
        if (reloadCount > 0) {
          tank.ammo = Math.min(tank.ammo + reloadCount, tank.maxAmmo);
          tank.lastShotTime = currentTime;
        }
      }
    });

    // Update bullets
    const bulletsToRemove: string[] = [];

    Object.values(newGameState.bullets).forEach((bullet) => {
      // Move bullet
      bullet.position.x += Math.cos(bullet.angle) * bullet.speed * deltaTime;
      bullet.position.y += Math.sin(bullet.angle) * bullet.speed * deltaTime;

      // Check if bullet is out of bounds
      if (
        bullet.position.x < 0 ||
        bullet.position.x > CANVAS_WIDTH ||
        bullet.position.y < 0 ||
        bullet.position.y > CANVAS_HEIGHT
      ) {
        bulletsToRemove.push(bullet.id);
        return;
      }

      // Check for collisions with obstacles
      if (checkBulletObstacleCollision(bullet, newGameState.obstacles)) {
        bulletsToRemove.push(bullet.id);
        return;
      }

      // Check for collisions with tanks
      Object.values(newGameState.tanks).forEach((tank) => {
        if (tank.isAlive && tank.id !== bullet.tankId) {
          if (checkBulletTankCollision(bullet, tank)) {
            // Damage tank
            tank.health -= bullet.damage;

            // Check if tank is destroyed
            if (tank.health <= 0) {
              tank.isAlive = false;
              tank.lastDeathTime = currentTime;
              tank.deaths++;

              // Award kill to shooter
              const shooter = newGameState.tanks[bullet.tankId];
              if (shooter) {
                shooter.kills++;
              }
            }

            bulletsToRemove.push(bullet.id);
            return;
          }
        }
      });
    });

    // Remove bullets that hit something or went out of bounds
    bulletsToRemove.forEach((bulletId) => {
      delete newGameState.bullets[bulletId];
    });

    setGameState(newGameState);
  };

  const { startGameLoop, isRunning } = useGameLoop(60, gameState, updateGame);

  // Start game loop when assets are loaded
  useEffect(() => {
    if (assetsLoaded && !isRunning) {
      startGameLoop();
    }
  }, [assetsLoaded, isRunning, startGameLoop]);

  // Prevent default behavior for game control keys
  useEffect(() => {
    const preventDefaultForGameKeys = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', ' ', 'q', 'e', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ',', '.'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefaultForGameKeys);
    
    return () => {
      window.removeEventListener('keydown', preventDefaultForGameKeys);
    };
  }, []);

  return (
    <div className="App">
      {assetsLoaded ? (
        <Game gameState={gameState} assets={assets} />
      ) : (
        <div className="loading">Loading game assets...</div>
      )}
    </div>
  );
};

export default App;
