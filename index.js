import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcryptjs from "bcryptjs";



// import bookRoute from "./route/book.route.js";
// import userRoute from "./route/user.route.js";
// import donateRoute from './route/donate.route.js'

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT || 4000;
const URI = process.env.MongoDBURI;

// connect to mongoDB
// schema

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});
// donate

const donationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    donation: {
        type: Number,
        required: true,
    },

});

//book
const bookSchema = mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    title: String,
});
const Book = mongoose.model("Book", bookSchema);

const Donate = mongoose.model("Donate", donationSchema);

const User = mongoose.model("User", userSchema);


try {
    mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("Connected to mongoDB");
} catch (error) {
    console.log("Error: ", error);
}

// middleware
const getBook = async(req, res) => {
    try {
        const book = await Book.find();
        res.status(200).json(book);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json(error);
    }
};

const postBook = async (req,res)=>{
    const newbook = new Book(req.body)
     newbook.save()
     res.json({msg:'book saved'})

}

// donation
const Donation = async (req, res) => { // Consistent naming convention
    try {
    //   const { email, name, address, donation } = req.body; // Destructuring for readability

      const newDonation = new Donate( req.body);
      console.log(newDonation)
      await newDonation.save();
  
      res.json({ msg: "Thank you for your donation!" }); // Consistent capitalization
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ msg: "Error processing donation. Please try again." }); // Informative error message
    }
  };

  //user
  const signup = async(req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcryptjs.hash(password, 10);
        const createdUser = new User({
            fullname: fullname,
            email: email,
            password: hashPassword,
        });
        await createdUser.save();
        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: createdUser._id,
                fullname: createdUser.fullname,
                email: createdUser.email,
            },
        });
    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
 const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!user || !isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        } else {
            res.status(200).json({
                message: "Login successful",
                user: {
                    _id: user._id,                   
                    fullname: user.fullname,
                    email: user.email,
                },
            });
        }
    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};



// defining routes
app.post("/post", postBook);
app.get("/", getBook);
app.post('/donate', Donation );
app.post("/signup", signup);
app.post("/login", login);




app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});