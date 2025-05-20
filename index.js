const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-8majy7x-shard-00-00.z95nrcs.mongodb.net:27017,ac-8majy7x-shard-00-01.z95nrcs.mongodb.net:27017,ac-8majy7x-shard-00-02.z95nrcs.mongodb.net:27017/?ssl=true&replicaSet=atlas-xt6l7r-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Freelancer Marketplace Server...");
});

app.listen(port, () => {
  console.log(`Freelancer Marketplace Server is running on port, ${port}`);
});
