import { readFile } from "node:fs/promises";
import Handlerbars from "handlebars";

export class View {
  constructor(path) {
    this.path = path;
  }

  async render(params) {
    const template = await readFile(this.path);
    return Handlerbars.compile(template.toString())(params);
  }
}
