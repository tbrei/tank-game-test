import React, { useRef, useEffect } from 'react';
import { GameState } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  assets: Record<string, HTMLImageElement>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, assets }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw obstacles
    gameState.obstacles.forEach((obstacle) => {
      ctx.fillStyle = '#555555';
      ctx.fillRect(
        obstacle.position.x,
        obstacle.position.y,
        obstacle.width,
        obstacle.height
      );
    });

    // Draw bullets
    Object.values(gameState.bullets).forEach((bullet) => {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(
        bullet.position.x,
        bullet.position.y,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw tanks
    Object.values(gameState.tanks).forEach((tank) => {
      if (!tank.isAlive) return;

      // Save context state
      ctx.save();

      // Draw tank chassis - rotate 90 degrees counterclockwise to fix orientation
      ctx.translate(tank.position.x + tank.width / 2, tank.position.y + tank.height / 2);
      ctx.rotate(tank.chassisAngle - Math.PI/2); // Subtract 90 degrees to fix rotation
      ctx.translate(-(tank.width / 2), -(tank.height / 2));
      
      // Apply tank color tint
      ctx.drawImage(assets.chassis, 0, 0, tank.width, tank.height);

      // Restore context for turret
      ctx.restore();
      
      // Draw tank turret
      ctx.save();
      
      // Position turret at tank center
      ctx.translate(tank.position.x + tank.width / 2, tank.position.y + tank.height / 2);
      ctx.rotate(tank.turretAngle - Math.PI/2); // Subtract 90 degrees to fix rotation
      
      // Calculate turret dimensions - use full height for proper aspect ratio
      const turretHeight = tank.height * 0.8; // Slightly smaller than tank
      const turretWidth = (assets.turret.width / assets.turret.height) * turretHeight; // Maintain aspect ratio
      
      // Position turret with rotation point toward back (1/3 from bottom)
      const offsetY = turretHeight / 6; // Move turret forward on tank
      
      ctx.drawImage(
        assets.turret,
        -turretWidth / 2,
        -turretHeight * 2/3 + offsetY, // Set rotation point at 2/3 from top
        turretWidth,
        turretHeight
      );
      
      ctx.restore();
    });
  }, [gameState, assets]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid black', backgroundColor: '#f0f0f0' }}
    />
  );
};

export default GameCanvas;
