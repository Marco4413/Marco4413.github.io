import * as a from "https://Marco4413.github.io/GeneratorCanvas/animation.js";
import { Animatable, SortingAnimation } from "https://Marco4413.github.io/GeneratorCanvas/examples/007-sorting_algorithms/sorting.js";

window.addEventListener("load", () => {
    const $generatorCanvas = document.getElementById("project_generator-canvas");
    const player = new a.AnimationPlayer($generatorCanvas);

    player.Resize(250, 250);
    player.Play(GeneratorCanvasAnimation);
});

function* GeneratorCanvasAnimation(c) {
    let sorterI = 0;
    // I could use Object.values(Animatable) but I want a specific order.
    const sorters = [
        Animatable.MergeSort,
        Animatable.QuickSort,
        Animatable.HeapSort,
        Animatable.InsertionSort,
        Animatable.BubbleSort,
    ];

    const sortOpt = {
        sorter: sorters[sorterI],
        updateDelay: 0.05,
        itemCount: 16,
        stopAtEnd: true,
    };

    while (true) {
        yield* SortingAnimation(c, sortOpt)
        sorterI = (sorterI+1) % sorters.length;
        sortOpt.sorter = sorters[sorterI];
    }
}
