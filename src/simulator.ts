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
            let dieValue = Math.floor(Math.random() * 3) + 1;

            let camelHasBeenFound = false;
            gameState.board.forEach((space, index) => {
                if (camelHasBeenFound) return;

                const matchingCamel = space.camels.filter(camel => camel === camelColor)[0];
                if (!_.isUndefined(matchingCamel)) {
                    let newSpaceIndex: number;

                    if (!isGameOver) {
                        newSpaceIndex = index + dieValue;
                        _.remove(space.camels, camel => camel === camelColor);
                        gameState.board[newSpaceIndex].camels.push(matchingCamel);
                    } else {
                        newSpaceIndex = index;
                    }

                    if (newSpaceIndex > 15) {
                        isGameOver = true;
                    }

                    roundResult.camelPositions.push({
                        camel: matchingCamel,
                        spaceNumber: newSpaceIndex
                    });
                    camelHasBeenFound = true;
                }
            });
        });

        // sort the results by the current camel position
        roundResult.camelPositions.sort((a, b) => {
            return b.spaceNumber - a.spaceNumber;
        });

        roundResults.push(roundResult);

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
        // console.log(JSON.stringify(output, (key, value) => {
        //     return key === 'camel' ? CamelColor[value] : value;
        // }, 4));

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
}