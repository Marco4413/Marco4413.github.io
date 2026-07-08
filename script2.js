import { MarkdownBuilder } from "https://Marco4413.github.io/MarkdownBuilder/MarkdownBuilder.js";

window.addEventListener("load", () => {
    const markdownOptions = {
        baseUrl: new URL(location.href),
        /** @param {HTMLImageElement} $img */
        getImageStyle: $img => {
            const style = { width: 192 };

            const isAvatar = $img.parentElement?.classList.contains("avatar-container") ?? false;
            if (isAvatar) style.width = 48;
            if ($img.classList.contains("tool-logo")) style.width = 16;
            return style;
        },
    };

    window.__PageToMarkdown = () => {
        const builder = new MarkdownBuilder(markdownOptions);
        return builder
            .SetElementWriter("input", self => self)
            .OverrideElementWriter("div", writer => (
                /** @param {HTMLDivElement} $el */
                (self, $el) => {
                    if ($el.hasAttribute("vr")) return self.WriteText("|");

                    const isProject = $el.classList.contains("project-container");
                    if (isProject) {
                        const isPrecededByHeading = $el.previousElementSibling?.tagName?.match(/^h[0-9]+$/i) !== null;
                        if (!isPrecededByHeading) self.WriteSeparator();
                        return writer(self, $el);
                    }

                    const isPageNameContainer = $el.classList.contains("page-name-container");
                    if (isPageNameContainer) return self.Write($el);

                    return writer(self, $el);
                }
            ))
            .WriteElement(document.body)
            .Build();
    };
});
