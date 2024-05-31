import fs from "fs"
import path from "path"
import RegExpExecArray from "util";

/*
- Prendere elementi da file e incapsularli in altri files.
- Eseguire questa operazione su richiesta.
 */
interface Component {
    readonly name: string;
    content: string;
}

interface HTMLFile {
    content: string;
}


class HtmlBuilder {

    private readonly componentDir: string;
    private readonly htmlDir: string;
    private readonly outDir: string;
    private readonly outFile: string;

    private static self: HtmlBuilder | undefined = undefined;

    private readonly htmls: Map<string, HTMLFile> = new Map<string, HTMLFile>();

    private static readonly componentRule = /<\s*component\s+name\s*=\s*"(?<name>[\w-]+)"\s*>(?<content>[^\0]*)<\s*\/\s*component\s*>/g;

    private static readonly htmlNameRule = /<\s*meta\s+name\s*=\s*"identifier"\s+content\s*=\s*"(?<name>[\w-]+)"\s*>/g;
    private static readonly htmlRule = /<\s*include\s*>\s*([\w-]+)\s*<\s*\/\s*include\s*>/g;


    private getComponent(content: string): Component {
        let component: { [key: string]: any } = {};

        let matches = Array.from(content.matchAll(HtmlBuilder.componentRule));
        if (matches.length == 1) {
            component["name"] = matches[0].groups?.name
            component["content"] = matches[0].groups?.content
        }
        if (!component.name || !component.content) {
            throw new Error("Component name or Inner HTML not found")
        }
        return component as Component;
    }

    private getComponents(): Component[] | undefined {
        let components: Component[] | undefined = undefined;
        fs.readdirSync(this.componentDir, { recursive: true }).forEach((value) => {
            if (components == undefined) components = [];
            let file = fs.openSync(path.join(this.componentDir, value.toString()), "r");
            let data = fs.readFileSync(file, "utf-8");
            fs.closeSync(file);
            components?.push(this.getComponent(data));
        });
        return components;
    }

    private getHtmlName(content: string): string[] | undefined {
        let name: string | undefined = undefined;
        let matches = Array.from(content.matchAll(HtmlBuilder.htmlNameRule));
        if (matches.length == 1) {
            name = matches[0].groups?.name;
            content = content.replace(matches[0][0], "")
        }
        if (name == undefined) throw new Error("HTML name not found or not valid!");
        return [name, content];
    }

    private compileHtml(html: string, mapping: Map<string, [number, number]>, components: Component[]) {
        let content = html;

        mapping.forEach((value, key) => {
            let component = components.find((value) => value.name === key);
            if (component == undefined) throw new Error("Component not found");
            content = content.slice(0, value[0]) + component.content + content.slice(value[1]);
        });

        return content;
    }

    private getHtmlComponents(content: string, components: Array<Component>): string {
        let mapping = new Map<string, [number, number]>();
        let matches: RegExpExecArray[];
        do {
            matches = Array.from(content.matchAll(HtmlBuilder.htmlRule));
            matches.forEach((value) => {
                mapping.set(value[1], [value.index, value.index + value[0].length]);
            });
            content = this.compileHtml(content, mapping, components);
            mapping.clear();
        } while (matches.length > 0);
        return content;
    }

    private getHtml(name: string, components: Array<Component>): HTMLFile | undefined {
        let html: HTMLFile | undefined = undefined;

        let files = fs.readdirSync(this.htmlDir, { recursive: true });
        for (let v of files) {
            v = v.toString();
            if (!v.endsWith(".html")) continue;
            let dir = path.join(this.htmlDir, v)
            if (path.join(this.outDir, this.outFile) === dir) continue;
            if (dir.startsWith(this.componentDir)) continue;
            let data = fs.readFileSync(fs.openSync(dir, "r"), "utf-8");
            let declaration = this.getHtmlName(data);
            if (declaration == undefined) continue;
            else {
                if (declaration[0] === name) {
                    html = {
                        content: this.getHtmlComponents(declaration[1], components)
                    } as HTMLFile;
                    break;
                }
            }
        }

        return html;
    }

    private constructor() {
        let cwd = process.cwd();

        let file = fs.openSync(path.join(cwd, "hbuilder.json"), "r");
        let data = JSON.parse(fs.readFileSync(file, "utf-8"));

        this.componentDir = path.join(cwd, data?.componentDirectory);
        this.htmlDir = path.join(cwd, data?.htmlDirectory);
        this.outDir = path.join(cwd, data?.outDirectory);
        this.outFile = data?.outFile ?? "index.html";

        fs.closeSync(file);
    }

    public onDemandBuild(name: string, output?: string): string {
        let components = this.getComponents();
        if (components == undefined) throw new Error("Components not found!");
        let html = this.getHtml(name, components);
        if (html == undefined) throw new Error("HTML not found!");
        fs.mkdirSync(this.outDir, { recursive: true });
        let fpath = path.join(this.outDir, output ?? this.outFile);
        fs.writeFileSync(fpath, html.content);
        return fpath;
    }

    public static getInstance() {
        if (HtmlBuilder.self == undefined) HtmlBuilder.self = new HtmlBuilder();
        return HtmlBuilder.self;
    }

}


export { HtmlBuilder };
