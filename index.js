const express = require("express");
const app = express();
require("dotenv/config"); // configure reading from .env
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
var bodyParser = require('body-parser')
// const User = require("./models/userModel");
// import { MongoClient } from "mongodb";
const MongoClient = require("mongodb").MongoClient

const db = require("./db");

const dbUrl = "mongodb://localhost:27017/";
db.connect();
const clientDB = new MongoClient(dbUrl);
// parse application/json
app.use(bodyParser.json())
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
  })
);
app.get("/", async (req, res) => {
  res.send("Hello World")
})
app.post("/signup", async (req, res) => {
  console.log(req.body)
  try {
    // console.log({ verified: verifyGoogleToken(req.body.credential) });
    if (req.body.response) {
      const verificationResponse = await verifyGoogleToken(req.body.response);
      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }
      const profile = verificationResponse?.payload;
      console.log(profile)
      const database = clientDB.db("MediBook");
      const User = database.collection("User");
      userEmail = profile?.email

      User.findOneAndUpdate(
        { email: userEmail },
        {
          $set: {
            firstName: profile?.given_name,
            lastName: profile?.family_name,
            email: profile?.email,
            token: jwt.sign({ email: profile?.email }, "mySecret", {
              expiresIn: "1d",
            }),
            is_user: true
          }
        },
        { upsert: true, new: true },
        (err, user) => {
          if (err) {
            console.log(`Error: ${err}`);
            return;
          }
          res.status(201).json({
            message: "Signup was successful",
            user: {
              firstName: profile?.given_name,
              lastName: profile?.family_name,
              email: profile?.email,
              token: jwt.sign({ email: profile?.email }, "mySecret", {
                expiresIn: "1d",
              }),
              is_user: true
            },
          });
        }
      );
      res.status(201).json({
        message: "Signup was successful",
        user: {
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          email: profile?.email,
          token: jwt.sign({ email: profile?.email }, "mySecret", {
            expiresIn: "1d",
          }),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: req,
    });
  }
});
app.post("/hospital-signup", async (req, res) => {
  console.log(req.body)
  try {
    // console.log({ verified: verifyGoogleToken(req.body.credential) });
    if (req.body.response) {
      const verificationResponse = await verifyGoogleToken(req.body.response);
      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }
      const profile = verificationResponse?.payload;
      console.log(profile)
      const database = clientDB.db("MediBook");
      const Hospital = database.collection("Hospital");
      userEmail = profile?.email

      Hospital.findOneAndUpdate(
        { email: userEmail },
        {
          $set: {
            firstName: profile?.given_name,
            lastName: profile?.family_name,
            email: profile?.email,
            token: jwt.sign({ email: profile?.email }, "mySecret", {
              expiresIn: "1d",
            }),
            is_user: false
          }
        },
        { upsert: true, new: true },
        (err, user) => {
          if (err) {
            console.log(`Error: ${err}`);
            return;
          }
          res.status(201).json({
            message: "Signup was successful",
            user: {
              firstName: profile?.given_name,
              lastName: profile?.family_name,
              email: profile?.email,
              token: jwt.sign({ email: profile?.email }, "mySecret", {
                expiresIn: "1d",
              }),
              is_user: false
            },
          });
        }
      );
      res.status(201).json({
        message: "Signup was successful",
        user: {
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          email: profile?.email,
          token: jwt.sign({ email: profile?.email }, "mySecret", {
            expiresIn: "1d",
          }),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: req,
    });
  }
});
app.get("/profile", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "mySecret");
  console.log(decoded, "Decoded");

  const database = clientDB.db("MediBook");
  const User = database.collection("User");

  let user = await User.findOne({ email: decoded.email })
  if (user) {
    res.status(200).json({
      message: "User profile fetched successfully",
      user: user,
    });
  }
  else {
    res.status(404).json({
      message: "User not found",
    })
  }
});
app.post("/profile", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const body = req.body
  console.log(body);
  const decoded = jwt.verify(token, "mySecret");
  console.log(decoded, "Decoded");

  const database = clientDB.db("MediBook");
  const User = database.collection("User");

  User.findOneAndUpdate(
    { email: decoded.email },
    {
      $set: {
        city: body.city,
        state: body.state
      }
    },
    { upsert: true, new: true },
    (err, user) => {
      if (err) {
        console.log(`Error: ${err}`);
        res.status(404).json({
          message: "User not found",
        })
      }
      console.log(user);
      res.status(201).json({
        message: "Change Successful",
        user: {
          city: body.city,
          state: body.state

        },
      });
    }
  );
  res.status(201).json({
    message: "Change Successful",
    user: {
      city: body.city,
      state: body.state

    },
  });
});
app.get("/hospital-profile", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "mySecret");
  console.log(decoded, "Decoded");

  const database = clientDB.db("MediBook");
  const Hospital = database.collection("Hospital");

  let hospital = await Hospital.findOne({ email: decoded.email })
  console.log("hospital>>>>>>>>>>", hospital)
  if (hospital.email) {
    res.status(200).json({
      message: "User profile fetched successfully",
      hospital: hospital,
    });
  }
  else {
    res.status(404).json({
      message: "User not found",
    })
  }
});
app.post("/hospital-profile", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "mySecret");
  console.log(decoded, "Decoded");
  const body = req.body
  console.log(body);

  const database = clientDB.db("MediBook");
  const Hospital = database.collection("Hospital");

  Hospital.findOneAndUpdate(
    { email: decoded.email },
    {
      $set: {
        city: body.city,
        state: body.state,
        hospital_name: body.hospital_name,
        hospital_latitude: body.hospital_latitude,
        hospital_longitude: body.hospital_longitude,
        hospital_phone: body.hospital_phone,
        hospital_desc: body.hospital_desc
      }
    },
    { upsert: true, new: true },
    (err, user) => {
      if (err) {
        console.log(`Error: ${err}`);
        res.status(404).json({
          message: "User not found",
        })
      }
      console.log(user);
      res.status(201).json({
        message: "Change Successful",
        hospital: {
          city: body.city,
          state: body.state,
          hospital_name: body.hospital_name,
          hospital_latitude: body.hospital_latitude,
          hospital_longitude: body.hospital_longitude,
          hospital_phone: body.hospital_phone,
          hospital_desc: body.hospital_desc
        },
      });
    }
  );
  res.status(201).json({
    message: "Change Successful",
    hospital: {
      city: body.city,
      state: body.state,
      hospital_name: body.hospital_name,
      hospital_latitude: body.hospital_latitude,
      hospital_longitude: body.hospital_longitude,
      hospital_phone: body.hospital_phone,
      hospital_desc: body.hospital_desc
    },
  });
});
app.get("/get-hospitals", async (req, res) => {
  const database = clientDB.db("MediBook");
  const Hospital = database.collection("Hospital");
  let response = {
    message: "Hospital profile fetched successfully",
  }
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "mySecret");
    console.log(decoded, "Decoded");
    const User = database.collection("User");
    let user;
    if (decoded) {
      user = await User.findOne({ email: decoded.email })
      if (user) {
        let hospitals = await Hospital.find({ city: user.city }, {
          projection: { is_user: 0, token: 0, lastName: 0, firstName: 0, }
        }).toArray()
        console.log("hospitals>>>>>>>>>>", hospitals)
        if (hospitals) {
          response.near_you = hospitals
        }
        else {
          res.status(404).json({
            message: "Hospital not found",
          })
        }
      }
    }
    else {
      response.near_you = []
    }
  }
  let allhospitals = await Hospital.find({}, {
    projection: { is_user: 0, token: 0, lastName: 0, firstName: 0, }
  }).toArray()
  console.log("allhospitals>>>>>>>>>>", allhospitals)
  if (allhospitals) {
    response.all_hospitals = allhospitals
  }
  res.status(200).json({
    response

  });
});
app.post("/add-clinics", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "mySecret");
  console.log(decoded, "Decoded");
  const body = req.body
  console.log(body);

  const database = clientDB.db("MediBook");
  const Hospital = database.collection("Hospital");
  const Clinic = database.collection("Clinic");

  let hospital = await Hospital.findOne({ email: decoded.email })
  console.log("hospital>>>>>>>>>>", hospital)
  if (hospital._id) {
    Clinic.findOneAndUpdate({
      hospital_id: hospital._id
    }, {
      $set: {
        hospital_id: `${hospital.city}${hospital._id}`,
        clinic_name: body.clinic_name,
        clinic_latitude: hospital.hospital_latitude,
        clinic_longitude: hospital.hospital_longitude,
        clinic_phone: body.clinic_phone,
        clinic_desc: body.clinic_desc,
        clinic_days: [
          { day: `${body.clinic_days[0].day}` },
          { day: `${body.clinic_days[1].day}` },
          { day: `${body.clinic_days[2].day}` },
          { day: `${body.clinic_days[3].day}` },
          { day: `${body.clinic_days[4].day}` },
          { day: `${body.clinic_days[5].day}` },
          { day: `${body.clinic_days[6].day}` }

        ],
        clinic_time: {
          start_time: body.clinic_time.start_time,
          end_time: body.clinic_time.end_time
        }
      }
    }, { upsert: true, new: true }, (err, result) => {
      if (err) {
        console.log(`Error: ${err}`);
        res.status(404).json({
          message: "User not found",
        })
      }
      console.log(result);
      res.status(201).json({
        message: "Change Successful",
        clinic: {
          hospital_id: `${hospital.city}${hospital._id}`,
          clinic_name: body.clinic_name,
          clinic_latitude: hospital.hospital_latitude,
          clinic_longitude: hospital.hospital_longitude,
          clinic_phone: body.clinic_phone,
          clinic_desc: body.clinic_desc,
          clinic_days: [
            { mon: `${body.clinic_days[0].day}` },
            { tue: `${body.clinic_days[1].day}` },
            { wed: `${body.clinic_days[2].day}` },
            { thu: `${body.clinic_days[3].day}` },
            { fri: `${body.clinic_days[4].day}` },
            { sat: `${body.clinic_days[5].day}` },
            { sun: `${body.clinic_days[6].day}` }
          ],
          clinic_time: {
            start_time: body.clinic_time.start_time,
            end_time: body.clinic_time.end_time
          }
        },
      });
    })
    console.log(body.clinic_days[0], "body.clinic_days");
    res.status(201).json({
      message: "Change Successful",
      clinic: {
        hospital_id: `${hospital.city}${hospital._id}`,
        clinic_name: body.clinic_name,
        clinic_latitude: hospital.hospital_latitude,
        clinic_longitude: hospital.hospital_longitude,
        clinic_phone: body.clinic_phone,
        clinic_desc: body.clinic_desc,
        clinic_days: [
          { mon: `${body.clinic_days[0].day}` },
          { tue: `${body.clinic_days[1].day}` },
          { wed: `${body.clinic_days[2].day}` },
          { thu: `${body.clinic_days[3].day}` },
          { fri: `${body.clinic_days[4].day}` },
          { sat: `${body.clinic_days[5].day}` },
          { sun: `${body.clinic_days[6].day}` }
        ],
        clinic_time: {
          start_time: body.clinic_time.start_time,
          end_time: body.clinic_time.end_time
        }
      },
    });
  }

})
app.get('/:id', async (req, res)=>{
  const database = clientDB.db("MediBook");
  const Hospital = database.collection("Hospital");
  const Clinic = database.collection("Clinic");

  console.log(req.params.id, "<<<<<");
  var o_id = req.params.id;

  let hospital = await Hospital.findOne({email: o_id})
  console.log("hospital>>>>>>>>>>", hospital)
  if (hospital) {
    let clinics = await Clinic.find({ hospital_id: `${hospital.city}${hospital._id}` }).toArray()
    console.log("clinics>>>>>>>>>>", clinics)
    if (clinics) {
      res.status(200).json({
        hospital: {
          hospital_name: hospital.hospital_name,
          hospital_latitude: hospital.hospital_latitude,
          hospital_longitude: hospital.hospital_longitude,
          hospital_phone: hospital.hospital_phone,
          hospital_desc: hospital.hospital_desc

        },
        clinics : clinics
      });
    }
    else {
      res.status(404).json({
        message: "Clinic not found",
      })
    }
  }
  else {
    res.status(404).json({
      message: "Hospital not found",
    })
  }
});

// for appointment
app.post("/add-appointment", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "mySecret");
  console.log(decoded, "Decoded");
  const body = req.body
  console.log(body);

  const database = clientDB.db("MediBook");
  const Appointment = database.collection("Appointment");

  Appointment.findOneAndUpdate()

})


app.use(express.json());


app.listen("5000", () => console.log("Server running on port 5000"));