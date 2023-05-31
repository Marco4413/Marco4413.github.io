/* MIT Copyright (c) 2023 [Marco4413](https://github.com/Marco4413) */
/* This script adds the theme-toggle custom HTML Element. It can be useful when testing styles. */

const _COLOR_SCHEME_DARK_MEDIA = "(prefers-color-scheme: dark)";

const GetDefaultThemeHref = (darkMode) =>
    `https://Marco4413.github.io/static/css/${darkMode ? "dark" : "light"}.css`;

const PrefersDarkMode = () => window.matchMedia(_COLOR_SCHEME_DARK_MEDIA).matches;

const CreateThemeToggle = (labelText, id, styleId, lightHref, darkHref) => {
    const style = document.getElementById(styleId) ??
        document.querySelector("link[rel=stylesheet]");
    if (style == null) console.error("Couldn't find style reference.");

    const container = document.createElement("div");
    
    const label = document.createElement("label");
    label.innerText = labelText;
    label.htmlFor = id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox"
    checkbox.id = id;

    lightHref ??= GetDefaultThemeHref(false);
    darkHref ??= GetDefaultThemeHref(true);

    checkbox.checked = PrefersDarkMode();
    window.matchMedia(_COLOR_SCHEME_DARK_MEDIA)
        .addEventListener("change", ev => checkbox.checked = ev.matches);
    checkbox.addEventListener("click", () => {
        style.href = checkbox.checked ? darkHref : lightHref;
    });

    container.appendChild(label);
    container.appendChild(checkbox);

    return container;
};

window.addEventListener("load", () => {
    for (const tt of document.getElementsByTagName("theme-toggle")) {
        const labelText = tt.getAttribute("value");
        const id = tt.getAttribute("id");
        const styleId = tt.getAttribute("style-id");
        const lightHref = tt.getAttribute("light-href");
        const darkHref = tt.getAttribute("dark-href");
        tt.replaceWith(CreateThemeToggle(labelText, id, styleId, lightHref, darkHref));
    }
});
