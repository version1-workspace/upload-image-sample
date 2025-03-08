import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { View } from "./view.mjs";
import { Post } from "./model.mjs";
import { config as cloudinaryConfig, client as imageClient } from "./image.mjs";

const hostname = "127.0.0.1";
const port = 3000;

const viewContext = {
  cloudinaryCloudName: cloudinaryConfig.cloudName,
  cloudinaryApiKey: cloudinaryConfig.apiKey,
};

const createRoute = (method, path, handler) => {
  return { method, path, handler };
};

const parseBody = async (req) => {
  const body = [];
  for await (const chunk of req) {
    body.push(chunk);
  }
  return JSON.parse(Buffer.concat(body).toString());
};

// Controller
const server = createServer(async (req, res) => {
  res.statusCode = 200;
  console.log("Request Received: ", req.method, req.url);
  const assetsRoutes = [
    createRoute("GET", "/assets/js/index.js", async (_req, res) => {
      const js = await readFile("./static/js/index.js");
      res.setHeader("Content-Type", "application/javascript");
      res.end(js);
      return;
    }),
  ];

  const htmlRoutes = [
    createRoute("GET", "/", async (_req, res) => {
      const template = new View("./views/index.tmpl.html");
      res.setHeader("Content-Type", "text/html");
      res.end(await template.render(viewContext));
      return;
    }),
  ];

  const apiV1Routes = [
    createRoute("GET", "/api/v1/posts", async (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      const posts = Post.all();
      return res.end(JSON.stringify({ data: posts }));
    }),
    createRoute("POST", "/api/v1/posts", async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      const reqBody = await parseBody(req);
      console.log("Request Body: ", reqBody);
      const {
        data: { images: postImages, body },
      } = reqBody;
      const images = postImages.map((image) => {
        return {
          url: image.url,
          publicId: image.publicId,
          ext: image.format,
          size: image.size,
          filename: image.originalName,
          height: image.height,
          width: image.width,
        };
      });
      const post = new Post({ body, images });
      post.save();
      return res.end(JSON.stringify({ data: post }));
    }),
    createRoute("POST", "/api/v1/images/signature", async (_req, res) => {
      res.setHeader("Content-Type", "applicaiton/json");
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = imageClient.utils.api_sign_request(
        {
          timestamp,
        },
        cloudinaryConfig.apiSecret,
      );

      return res.end(
        JSON.stringify({
          data: {
            signature,
            timestamp,
          },
        }),
      );
    }),
  ];

  const routes = [...assetsRoutes, ...htmlRoutes, ...apiV1Routes];
  const route = routes.find(
    (route) => route.method === req.method && route.path === req.url,
  );

  try {
    if (route) {
      route.handler(req, res);
      return;
    }
  } catch (error) {
    //console.error("Error: ", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Internal Server Error" }));
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Not Found" }));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
