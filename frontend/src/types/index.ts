export type BoardState = number[][];

export interface Move {
  row: number;
  col: number;
  player: number; // 1=black, 2=white
  timestamp: number;
}

export interface Position {
  row: number;
  col: number;
}

export type KeyMoveType = 'winning' | 'live-four' | 'live-three' | 'block';

export interface KeyMove {
  move: Move;
  moveNumber: number;
  type: KeyMoveType;
  description: string;
}

export interface GameRecord {
  id: string;
  moves: Move[];
  winner: number | null; // 0=draw, 1=black, 2=white, null=ongoing
  createdAt: string;
  duration: number;
  winningLine: Position[] | null;
  keyMoves: KeyMove[];
}

export interface AIConfig {
  depth: number;
  enabled: boolean;
  playerColor: number; // AI plays as this color
}

export type GameStatus = 'idle' | 'playing' | 'finished' | 'replaying';
