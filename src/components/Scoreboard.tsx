import React from 'react';
import { Tank } from '../types';

interface ScoreboardProps {
  tanks: Record<string, Tank>;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ tanks }) => {
  return (
    <div className="scoreboard">
      <h2>Scoreboard</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Kills</th>
            <th>Deaths</th>
            <th>K/D Ratio</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(tanks).map((tank) => (
            <tr key={tank.id}>
              <td style={{ color: tank.color }}>Player {tank.id}</td>
              <td>{tank.kills}</td>
              <td>{tank.deaths}</td>
              <td>{tank.deaths > 0 ? (tank.kills / tank.deaths).toFixed(2) : tank.kills}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Scoreboard;
