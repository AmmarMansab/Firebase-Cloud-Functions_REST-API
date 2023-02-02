const functions = require("firebase-functions");

//   npm run serve   // to start

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");

// Main app
const app = express();
app.use(cors({ origin: true }));

// Main database referance
const db = admin.firestore();

// Routes
app.get("/", (req, res) => {
  return res.status(200).send("Connected");
});

// Create -> post()
app.post("/api/create", (req, res) => {
  (async () => {
    try {
      // id --> `/${Date.now()}/` (everytime we will get unique id)
      await db.collection("userDetails").doc(`/${Date.now()}/`).create({
        id: Date.now(),
        name: req.body.name,
        ph: req.body.ph,
      });

      // return a response once it done successfully
      return res.status(200).send({ status: "Success", msg: "Data Saved" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "Failed", msg: error })
    }
  })();
});

// Get -> get()
// read specific user detail
app.get("/api/userDetail/:id", (req, res) => {
    (async () => {
      try {
        // requested doc
        const reqDoc = db.collection("userDetails").doc(req.params.id);
        let userDetail = await reqDoc.get();
        let response = userDetail.data();
  
        return res.status(200).send({ status: "Success", data: response });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });
      }
    })();
  });

  // read all user details
app.get("/api/userDetails", (req, res) => {
    (async () => {
      try {
        let query = db.collection("userDetails");
        let response = [];
  
        await query.get().then((data) => {
          let docs = data.docs; // query results
  
          docs.map((doc) => {
            const selectedData = {
              name: doc.data().name,
              ph: doc.data().ph,
            };
  
            response.push(selectedData);
          });
          return response;
        });
  
        return res.status(200).send({ status: "Success", data: response });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });
      }
    })();
  });

// Update -> put()
app.put("/api/update/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("userDetails").doc(req.params.id);
        await reqDoc.update({
          name: req.body.name,
          ph: req.body.ph,
        });
        return res.status(200).send({ status: "Success", msg: "Data Updated" });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });
      }
    })();
  });

// Delete -> delete()
app.delete("/api/delete/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("userDetails").doc(req.params.id);
        await reqDoc.delete();
        return res.status(200).send({ status: "Success", msg: "Data Removed" });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });
      }
    })();
  });

// exports the api to firebase cloud functions
exports.app = functions.https.onRequest(app);
