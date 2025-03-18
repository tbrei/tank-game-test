import React from 'react';
import { GameState } from '../types';
import GameCanvas from './GameCanvas';
import Scoreboard from './Scoreboard';
import PlayerUI from './PlayerUI';

interface GameProps {
  gameState: GameState;
  assets: Record<string, HTMLImageElement>;
}

const Game: React.FC<GameProps> = ({ gameState, assets }) => {
  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Tank Battle</h1>
      </div>
      <div className="game-content">
        <div className="player-ui-container">
          {Object.values(gameState.tanks).map((tank) => (
            <PlayerUI key={tank.id} tank={tank} />
          ))}
        </div>
        <GameCanvas gameState={gameState} assets={assets} />
        <Scoreboard tanks={gameState.tanks} />
      </div>
      <div className="game-footer">
        <div className="controls-info">
          <div className="player-controls">
            <h3>Player 1 Controls</h3>
            <p>Movement: WASD</p>
            <p>Turret: Q/E</p>
            <p>Shoot: Spacebar</p>
          </div>
          <div className="player-controls">
            <h3>Player 2 Controls</h3>
            <p>Movement: Arrow Keys</p>
            <p>Turret: ,/.</p>
            <p>Shoot: Right Ctrl/Shift</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
