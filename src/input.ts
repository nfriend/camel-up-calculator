import { IGameState, CamelColor } from './objects';

const input: IGameState = {
    unrolledDice: [
        CamelColor.Blue,
        CamelColor.Green,
        CamelColor.Orange,
        CamelColor.White,
        CamelColor.Yellow
    ],
    board: [
        { camels: [CamelColor.Orange] },
        { camels: [CamelColor.Blue, CamelColor.Green, CamelColor.White] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [CamelColor.Yellow] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },

        // overflow spaces after the finish line
        { camels: [] },
        { camels: [] },
        { camels: [] },
    ]
}

export { input }