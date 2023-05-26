const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const cors = require('cors');

// define port 

const port = process.env.PORT || 7000;

// Middleware 
app.use(cors())
app.use(express.json());


// Mongodb database setup 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apl9htr.mongodb.net/?retryWrites=true&w=majority`;

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
        // client.connect();
        // make legoToyDataCollection     
        const legoToyDataCollection = client.db('legoToys').collection('toys');
        // const indexKeys = { title: 1, category: 1 };
        // const indexOptions = { name: "toyName" };
        // const result = await legoToyDataCollection.createIndex(indexKeys, indexOptions);
        // lego toy get all data 

        // get all legoToys data 

        app.get('/legoToys', async (req, res) => {
            const cursor = await legoToyDataCollection.find().limit(20).toArray();
            res.send(cursor)
        })
        app.get('/showToy', async (req, res) => {
            const cursor = await legoToyDataCollection.find().toArray();
            res.send(cursor)
        })
        // get search data by allToy components

        app.get("/searchToy/:text", async (req, res) => {
            const text = req.params.text;
            const result = await legoToyDataCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { category: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });


        // get single data from legoToys

        app.get('/legoToys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await legoToyDataCollection.findOne(query)
            res.send(result)
        })
        // get category wise data 
        app.get('/toyCategory/:category', async (req, res) => {
            const id = req.params.category;
            const toys = await legoToyDataCollection.find({ category: id }).limit(3).toArray();
            // console.log(toy);
            res.send(toys)
        })
        // get data by email search       
        app.get('/myToys/:email', async (req, res) => {
            const result = await legoToyDataCollection.find({ sellerEmail: req.params.email }).sort({ price: 1 }).toArray();
            res.send(result);

        })

        app.get('/myToyEmailSort', async (req, res) => {
            const email = Object.values(req.query)[0];
            const sort = Object.values(req.query)[1];
            const query = { sellerEmail: email };
            const result = await legoToyDataCollection.find(query).sort({ price: sort }).toArray();
            res.send(result)
        })

        // lego toy post data 

        app.post('/legoToys', async (req, res) => {
            const legoData = req.body;
            legoData.price = parseFloat(legoData.price);
            const result = await legoToyDataCollection.insertOne(legoData);
            res.send(result);
        })

        // update data from myToys 

        app.put('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const toys = req.body;
            const filter = { _id: new ObjectId(id) };
            // const options = { upsert: true };
            const updateToys = {
                $set: {
                    price: parseFloat(toys.price),
                    quantity: toys.quantity,
                    description: toys.description
                }
            }
            const result = await legoToyDataCollection.updateOne(filter, updateToys);
            res.send(result);
        })
        //using delete method 
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await legoToyDataCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// initial check server running

app.get('/', (req, res) => {
    res.send('lego server is running')
})
app.listen(port, (req, res) => {
    console.log(`lego server is running on ${port}`);
})

