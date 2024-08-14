/* MIT Copyright (c) 2024 [Marco4413](https://github.com/Marco4413) */
/* This script adds the tool-logo custom HTML Element.
   You can customize the style through the .tool-logo css class.
   Icons are taken from https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons
    to which is appended the path provided through the icon attribute.
*/

// Don't edit these directly, use the helper methods instead.
const _TOOL_LOGO_MAP = {};
let _ToolLogoBaseUrl = "https://raw.githubusercontent.com/devicons/devicon/v2.16.0/icons/";

/**
 * @param {string} alias
 * @param {string} path An alias which starts with '//' is a full Url to the icon.
 */
const SetToolLogoAlias = (alias, path) => {
    _TOOL_LOGO_MAP[alias] = `${path}`;
};

/**
 * @param {string} alias
 * @returns {string|null} A path which starts with '//' is a full Url to the icon.
 */
const GetToolLogoAlias = alias => {
    return _TOOL_LOGO_MAP[alias] ?? null;
};

/** @param {string} baseUrl */
const SetToolLogoBaseUrl = baseUrl => {
    if (!baseUrl.endsWith("/"))
        baseUrl += "/";
    _ToolLogoBaseUrl = baseUrl;
};

/** @returns {string} The currently set base url for tool logos. Always ends with a '/' */
const GetToolLogoBaseUrl = () => _ToolLogoBaseUrl;

/**
 * @param {HTMLElement} $el
 * @returns {HTMLImageElement} The element $el was replaced with.
 */
const ReplaceWithToolLogo = $el => {
    const iconAlias = $el.getAttribute("icon");
    const iconPath = GetToolLogoAlias(iconAlias) ?? iconAlias;
    const iconUrl = iconPath.startsWith("//")
        ? iconPath.substring(2)
        : `${GetToolLogoBaseUrl()}${iconPath}`;
    const $img = document.createElement("img");
    $img.classList.add("tool-logo");
    $img.classList.add(...$el.classList);
    $img.src = iconUrl;
    $el.replaceWith($img);
    return $img;
};

window.addEventListener("load", () => {
    for (const $el of document.querySelectorAll("tool-logo"))
        ReplaceWithToolLogo($el);
});
