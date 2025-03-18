import { useEffect, useRef, useState } from 'react';
import { Controls, GameState, Player, Position, Tank, Bullet } from '../types';

// Custom hook for game loop
export const useGameLoop = (
  fps: number,
  gameState: GameState,
  updateGame: (deltaTime: number) => void
) => {
  const [isRunning, setIsRunning] = useState(false);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const startGameLoop = () => {
    setIsRunning(true);
  };

  const stopGameLoop = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;

    const tick = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = (time - previousTimeRef.current) / 1000;
        updateGame(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, updateGame]);

  return { startGameLoop, stopGameLoop, isRunning };
};

// Custom hook for keyboard controls
export const useKeyboardControls = (players: Player[]) => {
  const [playerControls, setPlayerControls] = useState<Record<string, Controls>>({});

  useEffect(() => {
    const initialControls: Record<string, Controls> = {};
    players.forEach((player) => {
      initialControls[player.id] = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        turretLeft: false,
        turretRight: false,
      };
    });
    setPlayerControls(initialControls);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Remove the e.repeat check to allow continuous movement when keys are held down
      // Prevent default behavior for game control keys to avoid page scrolling
      const newControls = { ...playerControls };

      // Player 1 controls (WASD + Space)
      if (e.key === 'w') {
        newControls[players[0].id].up = true;
        e.preventDefault();
      }
      if (e.key === 's') {
        newControls[players[0].id].down = true;
        e.preventDefault();
      }
      if (e.key === 'a') {
        newControls[players[0].id].left = true;
        e.preventDefault();
      }
      if (e.key === 'd') {
        newControls[players[0].id].right = true;
        e.preventDefault();
      }
      if (e.key === ' ') {
        newControls[players[0].id].shoot = true;
        e.preventDefault(); // Prevent spacebar from scrolling the page
      }
      if (e.key === 'q') {
        newControls[players[0].id].turretLeft = true;
        e.preventDefault();
      }
      if (e.key === 'e') {
        newControls[players[0].id].turretRight = true;
        e.preventDefault();
      }

      // Player 2 controls (Arrow keys + Right Ctrl/Shift)
      if (e.key === 'ArrowUp') {
        newControls[players[1].id].up = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        newControls[players[1].id].down = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') {
        newControls[players[1].id].left = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight') {
        newControls[players[1].id].right = true;
        e.preventDefault();
      }
      if (e.key === 'Control' && e.location === 2) {
        newControls[players[1].id].shoot = true;
        e.preventDefault();
      }
      if (e.key === 'Shift' && e.location === 2) {
        newControls[players[1].id].shoot = true;
        e.preventDefault();
      }
      if (e.key === ',') {
        newControls[players[1].id].turretLeft = true;
        e.preventDefault();
      }
      if (e.key === '.') {
        newControls[players[1].id].turretRight = true;
        e.preventDefault();
      }

      setPlayerControls(newControls);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const newControls = { ...playerControls };

      // Player 1 controls (WASD + Space)
      if (e.key === 'w') newControls[players[0].id].up = false;
      if (e.key === 's') newControls[players[0].id].down = false;
      if (e.key === 'a') newControls[players[0].id].left = false;
      if (e.key === 'd') newControls[players[0].id].right = false;
      if (e.key === ' ') newControls[players[0].id].shoot = false;
      if (e.key === 'q') newControls[players[0].id].turretLeft = false;
      if (e.key === 'e') newControls[players[0].id].turretRight = false;

      // Player 2 controls (Arrow keys + Right Ctrl/Shift)
      if (e.key === 'ArrowUp') newControls[players[1].id].up = false;
      if (e.key === 'ArrowDown') newControls[players[1].id].down = false;
      if (e.key === 'ArrowLeft') newControls[players[1].id].left = false;
      if (e.key === 'ArrowRight') newControls[players[1].id].right = false;
      if (e.key === 'Control' && e.location === 2) newControls[players[1].id].shoot = false;
      if (e.key === 'Shift' && e.location === 2) newControls[players[1].id].shoot = false;
      if (e.key === ',') newControls[players[1].id].turretLeft = false;
      if (e.key === '.') newControls[players[1].id].turretRight = false;

      setPlayerControls(newControls);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [players, playerControls]);

  return playerControls;
};

// Custom hook for collision detection
export const useCollisionDetection = () => {
  // Check if two rectangles are colliding
  const checkRectCollision = (
    rect1: { position: Position; width: number; height: number },
    rect2: { position: Position; width: number; height: number }
  ) => {
    return (
      rect1.position.x < rect2.position.x + rect2.width &&
      rect1.position.x + rect1.width > rect2.position.x &&
      rect1.position.y < rect2.position.y + rect2.height &&
      rect1.position.y + rect1.height > rect2.position.y
    );
  };

  // Check if a tank is colliding with any obstacles
  const checkTankObstacleCollision = (
    tank: Tank,
    obstacles: { position: Position; width: number; height: number }[]
  ) => {
    return obstacles.some((obstacle) => checkRectCollision(tank, obstacle));
  };

  // Check if a tank is colliding with another tank
  const checkTankTankCollision = (tank1: Tank, tank2: Tank) => {
    return checkRectCollision(tank1, tank2);
  };

  // Check if a bullet is colliding with a tank
  const checkBulletTankCollision = (bullet: Bullet, tank: Tank) => {
    // Don't collide with the tank that fired the bullet
    if (bullet.tankId === tank.id) return false;
    return checkRectCollision(bullet, tank);
  };

  // Check if a bullet is colliding with an obstacle
  const checkBulletObstacleCollision = (
    bullet: Bullet,
    obstacles: { position: Position; width: number; height: number }[]
  ) => {
    return obstacles.some((obstacle) => checkRectCollision(bullet, obstacle));
  };

  return {
    checkRectCollision,
    checkTankObstacleCollision,
    checkTankTankCollision,
    checkBulletTankCollision,
    checkBulletObstacleCollision,
  };
};

// Custom hook for asset loading
export const useAssetLoader = () => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [assets, setAssets] = useState<Record<string, HTMLImageElement>>({});

  const loadAssets = (assetPaths: Record<string, string>) => {
    const loadedAssets: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const totalAssets = Object.keys(assetPaths).length;

    return new Promise<Record<string, HTMLImageElement>>((resolve) => {
      Object.entries(assetPaths).forEach(([key, path]) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
          loadedAssets[key] = img;
          loadedCount++;
          if (loadedCount === totalAssets) {
            setAssets(loadedAssets);
            setAssetsLoaded(true);
            resolve(loadedAssets);
          }
        };
      });
    });
  };

  return { assets, assetsLoaded, loadAssets };
};
