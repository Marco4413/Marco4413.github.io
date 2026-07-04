import * as a from "https://Marco4413.github.io/GeneratorCanvas/animation.js";
import { Animatable, SortingAnimation } from "https://Marco4413.github.io/GeneratorCanvas/examples/007-sorting_algorithms/sorting.js";

import { MarkdownBuilder } from "./static/js/markdown-builder.js";
/** @import { MarkdownOptions } from './static/js/markdown-builder.js'; */

const MoveChildNodes = ($src, $dst) => {
    // Create a new array from childNodes because childNodes is live.
    // Changing it while iterating does not work.
    for (const $child of Array.from($src.childNodes))
        $dst.appendChild($child);
};

/** @param {HTMLElement} $el */
const ReplaceWithProjectContainer = $el => {
    const href     = $el.getAttribute("href") ?? "";
    const logoHref = $el.getAttribute("logo-href") ?? href;

    const logoKind = $el.getAttribute("logo-kind") ?? "image";
    const logoId   = $el.getAttribute("logo-id");
    const logoUrl  = $el.getAttribute("logo-url") ?? "";

    const $projectContainer = document.createElement("div");
    $projectContainer.classList.add("project-container");
    {
        let $logo;
        switch (logoKind) {
        case "none":
            break;
        case "image":
            $logo     = document.createElement("img");
            $logo.src = logoUrl;
            break;
        case "canvas":
            $logo    = document.createElement("canvas");
            break;
        default:
            console.warn(`Got invalid 'logo-kind' attribute for <project-container>: ${logoKind}`);
        }

        if ($logo) {
            const $projectLogoContainer = document.createElement("div");
            $projectLogoContainer.classList.add("project-logo-container");

            const $a = document.createElement("a");
            $a.href  = logoHref;

            if (logoId) $logo.id = logoId;

            $a.appendChild($logo);
            $projectLogoContainer.appendChild($a);
            $projectContainer.appendChild($projectLogoContainer);

            const $splitr = document.createElement("div");
            $splitr.setAttribute("splitr", "");
            $projectContainer.appendChild($splitr);
        }
    }

    const $projectDescription = document.createElement("div");
    $projectDescription.classList.add("project-description");
    MoveChildNodes($el, $projectDescription);

    $projectDescription.querySelectorAll("a[href='{href}']")
        .forEach($el => $el.setAttribute("href", href));

    $projectContainer.appendChild($projectDescription);
    $el.replaceWith($projectContainer);
    return $projectContainer;
};

window.addEventListener("load", () => {
    const projects = [];
    document.querySelectorAll("project")
        .forEach($el => projects.push(ReplaceWithProjectContainer($el)));

    /** @type {MarkdownOptions} */
    const markdownOptions = {
        baseUrl: new URL(location.href),
        getImageStyle: $img => {
            if ($img.classList.contains("tool-logo") || ($img.parentElement != null && $img.parentElement.classList.contains("avatar-container"))) {
                return {
                    width: "24pt",
                    style: "vertical-align: middle; width: 1.5em",
                };
            }
            return {};
        },
    };

    window.__PageToMarkdown = () => {
        const builder = new MarkdownBuilder(markdownOptions);
        return builder.WriteElement(document.body).Build();
    };

    window.__ProjectsToMarkdown = () => {
        const builder = new MarkdownBuilder(markdownOptions);
        projects.forEach($el => builder.WriteElement($el).WriteSeparator());
        return builder.Build();
    };

    const $generatorCanvas = document.getElementById("project-generator-canvas");
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
