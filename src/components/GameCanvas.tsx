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

      // Draw tank chassis
      ctx.translate(tank.position.x + tank.width / 2, tank.position.y + tank.height / 2);
      ctx.rotate(tank.chassisAngle);
      ctx.translate(-(tank.width / 2), -(tank.height / 2));
      
      // Apply tank color tint
      ctx.drawImage(assets.chassis, 0, 0, tank.width, tank.height);

      // Restore context for turret
      ctx.restore();
      
      // Draw tank turret
      ctx.save();
      ctx.translate(tank.position.x + tank.width / 2, tank.position.y + tank.height / 2);
      ctx.rotate(tank.turretAngle);
      
      // Calculate turret position (centered on tank)
      const turretWidth = tank.width * 0.6;
      const turretHeight = tank.height * 0.6;
      ctx.drawImage(
        assets.turret,
        -turretWidth / 2,
        -turretHeight / 2,
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
