import { IGameState, ISimulatorOutput, IRoundResult, CamelColor } from './objects';
import { Utility } from './utility';
import * as chalk from 'chalk';
import * as _ from 'lodash';

export class Simulator {

    public run = (startState: IGameState, iterations: number = 10000): void => {

        const startTime = Date.now();

        const results: IRoundResult[][] = [];
        for (var i = 0; i < iterations; i++) {
            results.push(this.runSimulation(startState));
        }

        const output = this.analyzeResults(results, iterations, startTime);
        this.logOutput(output);
    }

    private runSimulation = (gameState: IGameState, roundResults = []): IRoundResult[] => {

        // operate on a copy of the provided game state 
        // so we don't alter the original
        gameState = _.cloneDeep(gameState);

        let isGameOver: boolean = false;
        const roundResult: IRoundResult = { camelPositions: [] };

        // shuffle the unrolled dice and move the corresponding camel
        _.shuffle(gameState.unrolledDice).forEach(camelColor => {

            // roll the die
            let dieValue = Math.floor(Math.random() * 3) + 1;

            // for each space, try and find the camel that matches 
            // the color of the currently rolled die
            let camelHasBeenFound = false;
            gameState.board.forEach((space, index) => {

                // if we've previously found and moved the
                // matching camel, exit this loop early
                if (camelHasBeenFound) return;

                const matchingCamelIndex = space.camels.indexOf(camelColor);
                if (matchingCamelIndex !== -1) {
                    const matchingCamel = space.camels[matchingCamelIndex];
                    let newSpaceIndex: number;

                    if (!isGameOver) {
                        // only continue to move pieces if the game is not over

                        // calculate the index of the camel's new space
                        newSpaceIndex = index + dieValue;

                        // account for any desert tiles on the destination space
                        if (gameState.board[newSpaceIndex].desertTile) {
                            newSpaceIndex += gameState.board[newSpaceIndex].desertTile.value;
                        }

                        // remove the camels from their current space
                        const movedCamels = space.camels.splice(matchingCamelIndex);

                        // put the camels on their new space
                        gameState.board[newSpaceIndex].camels =
                            gameState.board[newSpaceIndex].camels.concat(movedCamels);

                    } else {
                        newSpaceIndex = index;
                    }

                    // if this camel has crossed the finish
                    // line, flag the game as over
                    if (newSpaceIndex > 15) {
                        isGameOver = true;
                    }

                    camelHasBeenFound = true;
                }
            });
        });

        _.forEachRight(gameState.board, (space, index) => {
            _.forEachRight(space.camels, camel => {
                roundResult.camelPositions.push({
                    camel: camel,
                    spaceNumber: index
                });
            });
        });

        roundResults.push(roundResult);

        // call this function recursively until the game is over
        if (isGameOver) {
            return roundResults;
        } else {
            gameState.unrolledDice = Utility.getEnumValues<CamelColor>(CamelColor);
            return this.runSimulation(gameState, roundResults);
        }
    }

    private analyzeResults = (results: IRoundResult[][], iterationCount: number, startTime: number): ISimulatorOutput => {

        let camelNextTurnWinCount: { [camelColor: number]: number } = {};
        let camelFinalWinCount: { [camelColor: number]: number } = {};

        Utility.getEnumValues<CamelColor>(CamelColor).forEach(camelColor => {
            camelNextTurnWinCount[camelColor] = 0;
            camelFinalWinCount[camelColor] = 0;
        });

        results.forEach(result => {
            camelNextTurnWinCount[_.first(result).camelPositions[0].camel]++;
            camelFinalWinCount[_.last(result).camelPositions[0].camel]++;
        });

        const output: ISimulatorOutput = {
            nextTurnStats: [],
            finalTurnStats: [],
            simulationDuration: undefined,
            iterationCount: iterationCount
        };

        _.forOwn(camelNextTurnWinCount, (value: number, key: string) => {
            output.nextTurnStats.push({
                camel: parseInt(key, 10),
                winProbability: value / iterationCount
            });
        });

        _.forOwn(camelFinalWinCount, (value: number, key: string) => {
            output.finalTurnStats.push({
                camel: parseInt(key, 10),
                winProbability: value / iterationCount
            });
        });

        output.nextTurnStats.sort((a, b) => {
            return b.winProbability - a.winProbability;
        });

        output.finalTurnStats.sort((a, b) => {
            return b.winProbability - a.winProbability;
        });

        output.simulationDuration = Date.now() - startTime;

        return output;
    }

    private logOutput = (output: ISimulatorOutput): void => {

        const camelToChalk = {};
        camelToChalk[CamelColor.Blue] = chalk.blue;
        camelToChalk[CamelColor.Green] = chalk.green;
        camelToChalk[CamelColor.Orange] = chalk.red;
        camelToChalk[CamelColor.White] = chalk.white;
        camelToChalk[CamelColor.Yellow] = chalk.yellow;

        console.log(chalk.gray('-----------------------------------------------'));
        console.log(chalk.gray(`Finished simulating ${output.iterationCount} games in ${output.simulationDuration}ms`));
        console.log('');
        console.log('Next turn prediction:');
        output.nextTurnStats.forEach(stat => {
            const formattedWinProb = Math.round(stat.winProbability * 10000) / 100;
            console.log(camelToChalk[stat.camel](`${CamelColor[stat.camel]}:\t${formattedWinProb}%`))
        });
        console.log('');
        console.log('Final turn prediction:');
        output.finalTurnStats.forEach(stat => {
            const formattedWinProb = Math.round(stat.winProbability * 10000) / 100;
            console.log(camelToChalk[stat.camel](`${CamelColor[stat.camel]}:\t${formattedWinProb}%`))
        });
        console.log('');
        console.log(chalk.gray('-----------------------------------------------'));
        console.log('');
    }

    private stringifyRoundResults = (roundResult) => {
        return JSON.stringify(roundResult, (key, value) => {
            return key === 'camel' ? CamelColor[value] : value;
        }, 4);
    }
}