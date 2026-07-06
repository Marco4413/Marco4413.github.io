import { MarkdownBuilder } from "https://Marco4413.github.io/MarkdownBuilder/MarkdownBuilder.js";

window.addEventListener("load", () => {
    const markdownOptions = {
        baseUrl: new URL(location.href),
        getImageStyle: $img => {
            if ($img.classList.contains("tool-logo")) {
                return { width: 16 };
            }
            return {};
        },
    };

    window.__PageToMarkdown = () => {
        const builder = new MarkdownBuilder(markdownOptions);
        return builder.OverrideElementWriter("div", writer => (
                /** @param {HTMLDivElement} $el */
                (self, $el) => {
                    const isPrecededByHeading = $el.previousElementSibling?.tagName?.match(/^h[0-9]+$/i) !== null;
                    const isProject = $el.classList.contains("project-container");
                    if (isProject && !isPrecededByHeading) self.WriteSeparator();
                    return writer(self, $el);
                }
            ))
            .WriteElement(document.body)
            .Build();
    };
});
