/* MIT Copyright (c) 2022 [Marco4413](https://github.com/Marco4413) */
/* This script appends a copyright notice with a ref url to the document's body */

console.warn("USING DEPRECATED VERSION OF copyright.js FROM https://Marco4413.github.io");
console.warn("ANY REFERENCE TO copyright.js SHOULD POINT TO https://Marco4413.github.io/static/js/copyright.js");

const script = document.currentScript;
window.addEventListener("load", () => {
    const urlMatcher = /^(?:https?:\/\/)?((?:www\.)?([^.]+)\.[^/]*)\/?.*$/g;
    const [ _, rootDocumentUrl, ioGithubName ] = urlMatcher.exec(window.location.href);
    
    const url = script.attributes.getNamedItem("url")?.value ?? "/";
    const name = script.attributes.getNamedItem("name")?.value ?? ioGithubName;
    const year = script.attributes.getNamedItem("year")?.value ?? (new Date().getFullYear());

    const a = document.createElement("a");
    a.href = url;
    a.innerText = `Copyright (c) ${year} ${name}`;

    a.style = script.style;
    a.classList.add(...script.classList.values(), "copyright");
    document.body.appendChild(a);
});
