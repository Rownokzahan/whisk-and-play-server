const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jxgrj34.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const products = client.db("whiskAndPlayDB").collection("toys");

        
        app.get('/toys', async (req, res) => {
            const result = await products.find().toArray();
            res.send(result)
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const result = await products.find({_id: new ObjectId(id)}).toArray();
            res.send(result)
        })

        app.get('/all-toys', async (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            const toys = await products.find().limit(limit).toArray();
            res.send(toys);
        });

        app.get('/my-toys/:email', async (req, res) => {
            const email = req.params.email;
            const result = await products.find({ sellerEmail: email }).toArray();
            res.send(result)
        })


        

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send({ message: "Whisk & Play server is running" });
})

app.listen(port, () => {
    console.log(`Whisk & Play server is running on port : ${port}`);
})