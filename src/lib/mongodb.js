
// import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";

// Database Connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("MonogoDB Connection Success")
    })
    .catch((error) => {
        console.log("ERROR while connecting to DB: ", error.message)
    })


// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
//         // Connect the client to the server
//         await client.connect();

//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });

//         console.log("Pinged your deployment. You successfully connected to MongoDB!man");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//     }
// }
// run().catch(console.dir);
