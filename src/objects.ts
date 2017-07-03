import { Utility } from './utility';

export enum CamelColor {
    Orange, Yellow, Green, Blue, White
}

export interface IGameState {
    board: IBoardSpace[];
    unrolledDice: CamelColor[];
}

export interface IBoardSpace {
    camels: CamelColor[];
    desertTile?: IDesertTile;
}

export interface IDesertTile {
    value: -1 | 1;
}

export interface ISimulatorOutput {
    nextTurnStats: {
        camel: CamelColor;
        winProbability: number;
    }[];
    finalTurnStats: {
        camel: CamelColor;
        winProbability: number;
    }[];
    simulationDuration: number;
    iterationCount: number;
};

export interface IRoundResult {
    camelPositions: {
        camel: CamelColor;
        spaceNumber: number;
    }[];
}