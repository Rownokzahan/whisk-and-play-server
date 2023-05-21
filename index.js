const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jxgrj34.mongodb.net/?retryWrites=true&w=majority`;

// const uri = `mongodb://localhost:27017`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});



const toys = client.db("whiskAndPlayDB").collection("toys");

app.get('/toys', async (req, res) => {
    const category = req.query.category;
    if (category === "Baking Kits" || category === "Food Prep Tools" || category === "Utensils") {
        const result = await toys.find({ category: category }).limit(8).toArray();
        return res.send(result);
    }
    const result = await toys.find().toArray();
    res.send(result)
})

app.get('/toys/:id', async (req, res) => {
    const id = req.params.id;
    const result = await toys.find({ _id: new ObjectId(id) }).toArray();
    res.send(result);
})

app.post('/toys', async (req, res) => {
    const newToy = req.body;
    const result = await toys.insertOne(newToy);
    res.send(result)
})

app.delete('/toys/:id', async (req, res) => {
    const id = req.params.id;
    const result = await toys.deleteOne({ _id: new ObjectId(id) });
    res.send(result)
})

app.patch('/toys/:id', async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const updatedToy = {
        $set: {
            ...body
        }
    }
    const result = await toys.updateOne({ _id: new ObjectId(id) }, updatedToy);
    res.send(result)
})


app.get('/all-toys', async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;

    const searchText = req.query.search;
    if (searchText) {
        const result = await toys.find({ ToyName: { $regex: searchText, $options: 'i' } }).limit(limit).toArray();
        return res.send(result);
    }

    const sort = req.query.sort;
    if (sort) {
        if (sort === "asc") {
            const result = await toys.find().sort({ "price": 1 }).limit(limit).toArray();
            return res.send(result);
        }

        if (sort === "desc") {
            const result = await toys.find().sort({ "price": -1 }).limit(limit).toArray();
            return res.send(result);
        }
    }

    const result = await toys.find().limit(limit).toArray();
    res.send(result);
})

app.get('/my-toys/:email', async (req, res) => {
    const email = req.params.email;

    const sort = req.query.sort;
    if (sort) {
        if (sort === "asc") {
            const result = await toys.find({ sellerEmail: email }).sort({ "price": 1 }).toArray();
            return res.send(result);
        }

        if (sort === "desc") {
            const result = await toys.find({ sellerEmail: email }).sort({ "price": -1 }).toArray();
            return res.send(result);
        }
    }

    const result = await toys.find({ sellerEmail: email }).toArray();
    res.send(result)
})


run().catch(console.dir);

app.get('/', (req, res) => {
    res.send({ message: "Whisk & Play server is running" });
})

app.listen(port, () => {
    console.log(`Whisk & Play server is running on port : ${port}`);
})