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
    const createTaskCollection = client.db("taskdb").collection("createTask");
    
    app.get("/tasks", async (req, res) => {
      const tasks = await createTaskCollection.find().toArray();
      res.send(tasks);
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await createTaskCollection.findOne(query);
      res.send(result);
    });

    app.get("/myTasks", async (req, res) => {
      const userEmail = req.query.email;
      if (!userEmail)
        return res.status(400).send({ message: "Email Required" });
      const tasks = await createTaskCollection
        .find({ email: userEmail })
        .toArray();
      res.send(tasks);
    });

    app.get("/latestTasks", async (req, res) => {
  try {
    const tasks = await createTaskCollection
      .find()
      .sort({ deadline: -1 })
      .limit(6)
      .toArray();
    res.send(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to fetch tasks", error });
  }
});

    app.post("/createTask", async (req, res) => {
      const newTask = req.body;
      const result = await createTaskCollection.insertOne(newTask);
      res.send(result);
    });

    app.put("/tasks/:id", async (req, res) => {
      const taskId = req.params.id;
      const updatedData = req.body;

      try {
        const result = await createTaskCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedData }
        );

        res.json({ modifiedCount: result.modifiedCount });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update task" });
      }
    });

    app.patch("/update-bid-count/:id", async (req, res) => {
      const id = req.params.id;
      const { bidsCount } = req.body;

      if (typeof bidsCount !== "number") {
        return res.status(400).send({ message: "Invalid bid count value" });
      }

      try {
        const result = await createTaskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { bidsCount: bidsCount } }
        );

        if (result.modifiedCount > 0) {
          res.send({ success: true, message: "Bid count updated" });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Task not found or not updated" });
        }
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const result = await createTaskCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

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
