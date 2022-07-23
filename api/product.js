const Stores = require("../models/Stores");
const {
  Shopify,
  ApiVersion,
  getCurrentSessionId,
  LATEST_API_VERSION,
} = require("@shopify/shopify-api");
var fs = require("fs");
// const {
//   verifyToken,
//   verifyTokenAndAuthorization,
//   verifyTokenAndAdmin,
// } = require("./verifyToken");
// const Transform = require("stream").Transform;
// const parser = new Transform();
// const newLineStream = require("new-line");
var parseUrl = require("body-parser");

let encodeUrl = parseUrl.urlencoded({ extended: false });
const router = require("express").Router();
// const { API_KEY, API_SECRET_KEY, SCOPES, HOST_SCHEME } = process.env;
// const SHOP = "yadwp.myshopify.com";
const HOST = "easier.yadbib.me";
Shopify.Context.initialize({
  API_KEY: "6ad4cdb5c161c980d12206140bd2efe3",
  API_SECRET_KEY: "2f4832ea58389bccddaa43561fc1ab00",
  SCOPES: ["read_all_orders", "read_products", "read_orders"],
  // HOST: HOST,
  HOST_NAME: HOST,
  IS_EMBEDDED_APP: true,
  // HOST_SCHEME: HOST_SCHEME,
  API_VERSION: LATEST_API_VERSION,
  //   SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const ACTIVE_SHOPIFY_SHOPS = {};

// parser._transform = function (data, encoding, done) {
//   let str = data.toString();
//   str = str.replace("<html>", "<!-- Begin stream -->\n<html>");

//   this.push(str);
//   done();
// };

//GET PRODUCT
router.get("/stores", async (req, res) => {
  try {
    const stores = await Stores.find();
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get("/all", async (req, res) => {
  // const session = await Shopify.Utils.loadCurrentSession(req, res);
  // console.log(session);
  // Create a new client for the specified shop.
  // const client = new Shopify.Clients.Rest(
  //   ACTIVE_SHOPIFY_SHOPS[SHOP].shop,
  //   ACTIVE_SHOPIFY_SHOPS[SHOP].accessToken
  // );
  // console.log(client);
  // Load the current session to get the `accessToken`.
  // const session = await Shopify.Utils.loadCurrentSession(req, res);
  // Create a new client for the specified shop.

  //   const id = Shopify.Auth.getCurrentSessionId(req, res);
  //   console.log("id", id);
  //   Shopify.Utils.
  console.log(req.query);
  const u = "offline_" + req.query.shop.toString();
  const session = await Shopify.Context.SESSION_STORAGE.loadSession(u);
  console.log("session2", session);
  if (session) {
    console.log(session.shop, session.accessToken);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const url = "https://" + session.shop + "/admin/api/2022-07/orders.json";
    // console.log(url);

    // .then((response) => response.json())
    // .then((data) => {
    //   console.log("Success:", data);
    // })
    // .catch((error) => {
    //   console.error("Error:", error);
    // });

    try {
      const resp = await fetch(url, {
        method: "GET", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken,
        },
        // body: JSON.stringify(data),
      });
      const data = await resp.json();
      //   console.log("Success:", data);
      res.status(200).json(data.orders);
      //   const products = await client.get({
      //     path: "/admin/api/2022-07/orders.json",
      //   });
      //   console.log("products", products);
    } catch (error) {
      console.log(error.message);
    }
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  if (ACTIVE_SHOPIFY_SHOPS[req.query.shop] === undefined) {
    // not logged in, redirect to login
    const html = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <title></title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <div class="container">
      <h2>Node JS Submit Form with Express Js - RemoteStack.io</h2>
      <form action="/api/shopify/platform" method="POST">
          <div class="form-group mb-3">
          <input hidden type="text" value='${req.query.shop}' class="form-control" placeholder="shop" name="shop">
        </div>
        <div class="form-group mb-3">
          <label>Platform Domaine</label>
          <input type="text" class="form-control"  placeholder="Platform" name="platform">
        </div>

        <div class="d-grid mt-3">
        <button type="submit" class="btn btn-danger">Submit</button>
        </div>
      </form>
  </body>
</html>`;
    var fileName = __dirname + "/form.html";
    fs.readFile(fileName, function (err, data) {
      // res.writeHead(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
      // return res.send(fileName);
    });
    // res.redirect(`/api/shopify/auth?shop=${req.query.shop}`);
    // console.log("store not found", req.query);
  } else {
    res.send("Hello world!");
    // Load your app skeleton page with App Bridge, and do something amazing!
    res.end();
  }
});

router.post("/platform", encodeUrl, (req, res) => {
  console.log(req.body);
  if (ACTIVE_SHOPIFY_SHOPS[req.body.shop] === undefined) {
    console.log("store not found", req.body.platform);
    const inurl = req.body.platform;
    res.redirect(`/api/shopify/${inurl}/auth`);
  } else {
    res.send("Hello world!");
  }
});
router.get("/:plat/auth", async (req, res) => {
  console.log("query", req.query);
  console.log("params", req.params);
  let authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop,
    "/api/shopify/auth/callback" + req.params.plat,
    false
  );
  // console.log(req.query.shop);
  // console.log(authRoute);
  return res.redirect(authRoute);
});
router.get("/auth/callback", async (req, res) => {
  //   console.log("store not found", req.query);

  try {
    const session = await Shopify.Auth.validateAuthCallback(
      req,
      res,
      req.query
    ); // req.query must be cast to unkown and then AuthQuery in order to be accepted
    ACTIVE_SHOPIFY_SHOPS[req.query.shop] = session;
    console.log("session", session);
    const sendIt = await axios({
      method: "post",
      url: "https://" + req.query.platform + "/api/shopify/new",
      data: {
        session,
      },
    });
    console.log(sendIt.data);
    const addtodb = new Stores({
      shop: session.shop,
      accessToken: session.accessToken,
    });
    await addtodb.save();
  } catch (error) {
    console.error(error); // in practice these should be handled more gracefully
  }
  return res.redirect(
    `/api/shopify?host=${req.query.host}&shop=${req.query.shop}&platform=${req.query.platform}`
  ); // wherever you want your user to end up after OAuth completes
});

module.exports = router;
