import crypto from "node:crypto";
import { client } from "./image.mjs";

const database = [];

export class Image {
  constructor({ publicId, url, ext, size, filename, height, width }) {
    this.id = generateID();
    this.publicId = publicId;
    this.url = url;
    this.ext = ext;
    this.size = size;
    this.filename = filename;
    this.height = height;
    this.width = width;
  }

  get variants() {
    return {
      original: this.url,
      medium: client.url(this.publicId, {
        fetch_format: "auto",
        quality: "auto",
        width: 400,
      }),
      high: client.url(this.publicId, {
        fetch_format: "auto",
        quality: "auto",
        width: 800,
      }),
    };
  }

  toJSON() {
    return {
      id: this.id,
      variants: this.variants,
      ext: this.ext,
      filename: this.filename,
      height: this.height,
      width: this.width,
      size: this.size,
    };
  }
}

export class Post {
  static all() {
    return database;
  }

  constructor({ body, images }) {
    this.id = generateID();
    this.body = body;
    this.images = images.map((image) => new Image(image));
  }

  save() {
    database.unshift(this);
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
