const express = require("express");
const app = express();
const shopify = require("./api/product");
const cors = require("cors");
app.use(cors());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ extended: false }));

app.use("/api/shopify", shopify);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

const PORT = 5000; //process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
