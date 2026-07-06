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
    document.querySelectorAll("project").forEach(ReplaceWithProjectContainer);
});
