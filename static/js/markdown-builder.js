/**
 * @typedef {object} MarkdownOptions
 * @property {URL|string} [baseUrl]
 * @property {($img: HTMLImageElement) => { width?: number, style?: string }} [getImageStyle]
 */

/**
 * @template {Element} T
 * @typedef {(builder: MarkdownBuilder, $element: T) => MarkdownBuilder} ElementWriter
 */

export class MarkdownBuilder {
    /** @type {MarkdownOptions} */
    #options;

    /**
     * INVARIANT: `.length > 0`
     * @type {string[]}
     */
    #lines;

    /** @typedef {"OL"|"UL"} ListKind */
    /** @typedef {{ kind: ListKind, itemIndex: number }} ListDefinition */

    /** @type {ListDefinition[]} */
    #lists;

    /** @param {MarkdownOptions} opt taken by reference, may mutate (but shouldn't) */
    constructor(opt={}) {
        this.#options = opt;
        this.#lines = [""];
        this.#lists = [];
    }

    get options() { return this.#options; }

    /** @param {HTMLElement} $el */
    WriteElement($el) {
        const tagName = $el.tagName.toUpperCase();
        const elementWriter = MarkdownBuilder.GetElementWriter(tagName);
        if (elementWriter != null) {
            elementWriter(this, $el);
        } else {
            console.warn(`tag '${tagName}' not handled`);
            this.WriteChildNodes($el);
        }
        return this;
    }

    Build() {
        this.TrimTrailingWhitespaces();
        return this.#lines.join("\n");
    }

    //----------------------------------------

    WriteHardLine()  { return this.#WriteNLines(2); }
    WriteSoftLine()  { return this.#WriteNLines(1); }
    WriteSeparator() { return this.WriteHardLine().WriteRaw("---").WriteHardLine(); }

    /** @param {string} text */
    WriteText(text) {
        const lastLine = this.#lines[this.#lines.length-1];
        text = text.replaceAll(/\s+/g, " ");
        if (lastLine.length <= 0 || /\s$/.test(lastLine))
            text = text.trimStart();
        return this.WriteRaw(text);
    }

    /** @param {string} text */
    WriteRaw(text) {
        const lines = text.split("\n");
        for (let i = 0; i < lines.length-1; ++i) {
            this.#lines[this.#lines.length-1] += line;
            this.#TrimLastLine();
            this.#lines.push("");
        }
        this.#lines[this.#lines.length-1] += lines[lines.length-1];
        return this;
    }

    /** @param {Element} $el */
    WriteChildNodes($el) {
        for (const $child of $el.childNodes) {
            const nodeName = $child.nodeName.toUpperCase();
            if (nodeName === "#COMMENT") continue;
            if ($child.tagName == null) {
                if (nodeName !== "#TEXT")
                    console.warn(`node '${nodeName}' not handled`);
                this.WriteText($child.textContent);
            } else {
                this.WriteElement($child);
            }
        }
        return this;
    }

    /** @param {ListKind} kind */
    PushList(kind) {
        this.#lists.push({ kind, itemIndex: 1 })
        return this;
    }

    PopList() {
        this.#lists.pop();
        return this;
    }

    /** @param {HTMLLIElement} $li */
    WriteListItem($li) {
        if (this.#lists.length <= 0) return this.WriteChildNodes($li).WriteSoftLine();
        const lastListIndex = this.#lists.length-1;
        const list = this.#lists[lastListIndex];

        const indent = "  ".repeat(lastListIndex);
        const point  = list.kind === "OL" ? `${list.itemIndex}. ` : "- ";
        ++list.itemIndex;

        return this.WriteRaw(`${indent}${point}`).WriteChildNodes($li).WriteSoftLine();
    }

    //----------------------------------------

    TrimTrailingWhitespaces() {
        for (let i = 0; i < this.#lines.length; ++i) {
            this.#lines[i] = this.#lines[i].trimEnd();
        }
    }

    /** @param {string} href */
    ResolveUrl(href) {
        const baseUrl = this.#options.baseUrl ?? location.href;
        return new URL(href, baseUrl).href;
    }

    //----------------------------------------

    #WriteNLines(n) {
        this.#TrimLastLine();

        let linesCount = 0;
        for (let i = this.#lines.length-1; i >= 0; --i) {
            if (linesCount >= n) break;
            if (this.#lines[i] === "") ++linesCount;
            else break;
        }
        for (let i = linesCount; i < n; ++i) {
            this.#lines.push("");
        }
        return this;
    }

    #TrimLastLine() {
        const lastIndex = this.#lines.length-1;
        this.#lines[lastIndex] = this.#lines[lastIndex].trimEnd();
    }

    //----------------------------------------

    /** @type {Map<string, ElementWriter<Element>>} */
    static #elementWriters = new Map();

    /**
     * @template {keyof HTMLElementTagNameMap} K
     * @param {K} tagName
     * @param {ElementWriter<HTMLElementTagNameMap[K]>} writer
     */
    static RegisterElementWriter(tagName, writer) {
        if (MarkdownBuilder.GetElementWriter(tagName) != null) {
            const message = `overwriting existing '${tagName}' writer`;
            console.warn(message);
            console.trace(message);
        }
        MarkdownBuilder.#elementWriters.set(tagName.toUpperCase(), writer);
        return MarkdownBuilder;
    }

    /**
     * @template {keyof HTMLElementTagNameMap} K
     * @param {K} tagName
     * @returns {ElementWriter<HTMLElementTagNameMap[K]>|null}
     */
    static GetElementWriter(tagName) {
        return MarkdownBuilder.#elementWriters.get(tagName.toUpperCase()) ?? null;
    }
}

MarkdownBuilder
    .RegisterElementWriter("hr",     (self, $el) => self.WriteSeparator())
    .RegisterElementWriter("h1",     (self, $el) => self.WriteRaw("# ").WriteChildNodes($el).WriteHardLine())
    .RegisterElementWriter("h2",     (self, $el) => self.WriteRaw("## ").WriteChildNodes($el).WriteHardLine())
    .RegisterElementWriter("h3",     (self, $el) => self.WriteRaw("### ").WriteChildNodes($el).WriteHardLine())
    .RegisterElementWriter("h4",     (self, $el) => self.WriteRaw("#### ").WriteChildNodes($el).WriteHardLine())
    .RegisterElementWriter("body",   (self, $el) => self.WriteChildNodes($el).WriteHardLine())
    .RegisterElementWriter("p",      (self, $el) => self.WriteChildNodes($el).WriteHardLine())
    .RegisterElementWriter("ul",     (self, $el) => self.WriteSoftLine().PushList("UL").WriteChildNodes($el).PopList().WriteSoftLine())
    .RegisterElementWriter("ol",     (self, $el) => self.WriteSoftLine().PushList("OL").WriteChildNodes($el).PopList().WriteSoftLine())
    .RegisterElementWriter("span",   (self, $el) => self.WriteChildNodes($el))
    .RegisterElementWriter("label",  (self, $el) => self.WriteChildNodes($el))
    .RegisterElementWriter("li",     (self, $el) => self.WriteListItem($el))
    .RegisterElementWriter("i",      (self, $el) => self.WriteRaw("*").WriteChildNodes($el).WriteRaw("*"))
    .RegisterElementWriter("b",      (self, $el) => self.WriteRaw("**").WriteChildNodes($el).WriteRaw("**"))
    .RegisterElementWriter("input",  (self, $el) => self)
    .RegisterElementWriter("script", (self, $el) => self)
    .RegisterElementWriter("canvas", (self, $el) => self)
    .RegisterElementWriter("div",    (self, $el) => {
        if ($el.hasAttribute("vr")) return self.WriteRaw("|");
        return self.WriteChildNodes($el).WriteHardLine();
    })
    .RegisterElementWriter("a",      (self, $el) => {
        const href = $el.hasAttribute("href") ? self.ResolveUrl($el.getAttribute("href")) : "";
        return self.WriteRaw("[").WriteChildNodes($el).WriteRaw(`](${href})`);
    })
    .RegisterElementWriter("img",    (self, $el) => {
        const alt = $el.getAttribute("alt") ?? "";
        const src = $el.hasAttribute("src") ? self.ResolveUrl($el.getAttribute("src")) : "";

        let width = 192;
        let style = "";

        if (self.options.getImageStyle != null) {
            const imageStyle = self.options.getImageStyle($el);
            width = imageStyle.width ?? width;
            style = imageStyle.style ?? style;
        }

        const aspectRatio = $el.naturalWidth > 0 ? $el.naturalHeight / $el.naturalWidth : 0;
        const height = aspectRatio * width;

        return self.WriteRaw(`<img src="${src}" alt="${alt}" width="${width}px" height="${height}px" style="${style}">`);
    });
