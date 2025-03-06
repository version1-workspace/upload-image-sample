import { createServer } from "node:http";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";

const hostname = "127.0.0.1";
const port = 3000;

// View
class View {
  constructor(path) {
    this.path = path;
  }

  async render() {
    return await readFile(this.path);
  }
}

// Model
class Image {
  constructor({ url, ext, size, filename }) {
    this.id = generateID();
    this.url = url;
    this.ext = ext;
    this.size = size;
    this.filename = filename;
  }

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      ext: this.ext,
      filename: this.filename,
    };
  }
}

class Post {
  static all() {
    return database;
  }

  constructor({ body, images }) {
    this.id = generateID();
    this.body = body;
    this.images = images.map((image) => new Image(image));
  }

  save() {
    console.log("Saving Post: ", this);
    database.push(this);
  }

  toJSON() {
    return {
      id: this.id,
      body: this.body,
      images: this.images.map((image) => image.toJSON()),
    };
  }
}

const generateID = () => crypto.randomBytes(16).toString("hex");

// Controller
const server = createServer(async (req, res) => {
  res.statusCode = 200;
  console.log("Request Received: ", req.method, req.url);
  if (req.method === "GET" && req.url === "/") {
    const template = new View("./views/index.tmpl.html");
    res.setHeader("Content-Type", "text/html");
    res.end(await template.render());
    return;
  }

  if (req.method === "POST" && req.url === "/api/v1/posts") {
    res.setHeader("Content-Type", "applicaiton/json");
    return;
  }

  if (req.method === "GET" && req.url === "/api/v1/posts") {
    res.setHeader("Content-Type", "applicaiton/json");
    const posts = Post.all();
    return res.end(JSON.stringify({ data: posts }));
  }

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Not Found" }));
});

const database = [];

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
