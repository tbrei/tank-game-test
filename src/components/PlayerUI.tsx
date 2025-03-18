import React from 'react';
import { Tank } from '../types';

interface PlayerUIProps {
  tank: Tank;
}

const PlayerUI: React.FC<PlayerUIProps> = ({ tank }) => {
  return (
    <div className="player-ui" style={{ color: tank.color }}>
      <div className="player-info">
        <h3>Player {tank.id}</h3>
        <div className="health-bar-container">
          <div 
            className="health-bar" 
            style={{ 
              width: `${(tank.health / tank.maxHealth) * 100}%`,
              backgroundColor: tank.color 
            }}
          />
        </div>
        <div className="health-text">
          Health: {tank.health}/{tank.maxHealth}
        </div>
        <div className="ammo-text">
          Ammo: {tank.ammo}/{tank.maxAmmo}
        </div>
        <div className="score-text">
          Score: {tank.kills}
        </div>
      </div>
    </div>
  );
};

export default PlayerUI;
