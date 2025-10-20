import path from 'path'
import { fileURLToPath } from 'url'
import fs from "fs";
import dotenv from 'dotenv'
import cors from 'cors'
import session from 'express-session'
// import passport from './config/passport.js'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })
import express from 'express'
import * as indexRouter from './src/modules/index.router.js'
import { connectDB } from './config/connection.js'
import { globalErrorHandling } from './src/middleware/errorHandling.js'
const app = express()

// setup port and the baseUrl
const port = process.env.PORT || 5000
const baseUrl = process.env.BASEURL





const allowedOrigins = [
  "http://localhost:5173",     
  "http://127.0.0.1:5173",
  "http://194.238.22.100:5173",     
  "http://194.238.22.100:3000", 
  undefined,                   
  null
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
};

// Apply CORS
app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

// Session config for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));




// app.use(passport.initialize())
// app.use(passport.session())

//convert Buffer Data
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));



// OAuth success route
app.get('/oauth-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'oauth-success.html'));
});

//Setup API Routing 
app.use(`${baseUrl}/Cab`, indexRouter.CabRouter)
app.use(`${baseUrl}/scheme`, indexRouter.SchemeRouter)



app.get("/Welcome_API", (req, res) => {
  res.send("<h1>🚀 Welcome to the SaaS API!</h1><p>Server is running successfully.</p>");
});



app.use((req, res) => {
  res.status(404).send("Invalid route, please check the URL or method");
});




connectDB()
// // Handling Error
app.use(globalErrorHandling)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))