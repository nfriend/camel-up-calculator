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
        { camels: [CamelColor.Blue, CamelColor.Orange] },
        { camels: [CamelColor.Green, CamelColor.White] },
        { camels: [CamelColor.Yellow] },
        { camels: [], desertTile: { value: 1 } },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
        { camels: [] },
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