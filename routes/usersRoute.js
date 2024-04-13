const express = require("express");
const router = express.Router();
const UserModel = require("../models/user");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const bcrypt = require("bcryptjs");



const JWT_SECRET =
    "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const generateUniquePwd = async () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const generateUniqueID = async () => {
    let userID = "U" + Math.floor(10000000 + Math.random() * 90000000);
    const userId = await UserModel.findOne({ userID: userID });
    if (userId) {
        return generateUniqueID(userID); // Pass the userID as an argument
    }
    return userID;
};

router.post("/addUser", async (req, res) => {
    const UserUserData = req.body;
    const password = await generateUniquePwd();
    const userID = await generateUniqueID();
    UserUserData.password = password;
    UserUserData.userID = userID;

    const newUser = new UserModel(UserUserData);

    try {
        await newUser.save();
        res.send("User added successfully");
        console.log("User added successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.get("/getUser", async (req, res) => {
    try {
        const users = await UserModel.find();
        res.send(users);
        console.log(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/deleteUser", async (req, res) => {
    try {
        const { userID } = req.body; // Extract userID from request body
        const deletedUser = await UserModel.findOneAndDelete({ userID });
        if (!deletedUser) {
            return res.status(404).send("User not found");
        }
        console.log("Deleted user:", deletedUser);
        res.send("User deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/editUser", async (req, res) => {
    const userData = req.body;
    const userID = userData.userID;
    try {
        await UserModel.findOneAndUpdate({ userID: userID }, userData);
        res.send("Employee updated successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post("/suspendUser", async (req, res) => {
    const userData = req.body;
    const userID = userData.userID;
    try {
        await UserModel.findOneAndUpdate(
            { userID: userID },
            { status: "Suspended" }
        );
        res.send("User suspended successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post("/activeUser", async (req, res) => {
    const userData = req.body;
    const userID = userData.userID;
    try {
        await UserModel.findOneAndUpdate(
            { userID: userID },
            { status: "Active" }
        );
        res.send("User activated successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({
            email: email,
            password: password,
        });
        if (user) {
            const temp = {
                userID: user.userID,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                userType: user.userType,
                status: user.status,
                profilePic: user.profilePic,
            };
            res.send(temp);
        } else {
            return res.status(400).json({ message: "Login Failed" });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post("/register", async (req, res) => {
    const userID = await generateUniqueID();

    const newuser = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        userID: userID,
        username: req.body.username,
        profilePic: req.body.profilePic,
    });

    try {
        const user = await newuser.save();
        return res.send("User Registered Successfully");
    } catch (error) {
        console.log("error in route");
        return res.status(400).json({ error });
    }
});

router.post("/getUserById", async (req, res) => {
    const { userID } = req.body;
    try {
        const user = await UserModel.findOne({
            userID: userID,
        });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/updateUserProfile", async (req, res) => {
    const { userID, profilePic, username } = req.body;
    try {
        await UserModel.findOneAndUpdate(
            { userID: userID },
            { profilePic: profilePic }
        );
        res.send("Profile updated successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post("/check-existing", async (req, res) => {
    const { email } = req.body;

    try {
        // Check if a user with the provided email exists in the database
        const existingUser = await UserModel.findOne({ email });

        // If a user with the provided email exists, return true
        // Otherwise, return false
        return res.json({ exists: !!existingUser });
    } catch (error) {
        console.error("Error checking existing user:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const oldUser = await UserModel.findOne({ email });
        if (!oldUser) {
            return res.json({ status: "User Not Exists!!" });
        }

        // Generate token
        const secret = JWT_SECRET + oldUser.password;
        const token = jwt.sign(
            { email: oldUser.email, id: oldUser.userID },
            secret,
            { expiresIn: "5m" }
        );

        // Construct reset link without including token
        const resetLink = `http://localhost:5000/reset-password/${oldUser.userID}/${token}`;
        console.log(resetLink);

        // Send the reset link and token to the user via email
        sendResetLinkByEmail(oldUser.email, resetLink, token);

        res.json({ status: "Email sent with reset instructions" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Function to send reset link to user's email
function sendResetLinkByEmail(email, resetLink, token) {
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "adarsh438tcsckandivali@gmail.com",
            pass: "rmdklolcsmswvyfw",
            
        },
    });

    var mailOptions = {
        from: "evnify6@gmail.com",
        to: email,
        subject: "Password Reset",
        // Include reset link in the email body
        text: `To reset your password, click on the following link: ${resetLink}\n\nToken: ${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}


router.get("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    try {
        // Verify the token
        const secret = JWT_SECRET + (await UserModel.findOne({ userID: id })).password;
        const decoded = jwt.verify(token, secret);
        // Redirect to the reset password page passing along the user ID
        res.redirect(`http://localhost:3000/reset-password?id=${decoded.id}`);
    } catch (error) {
        console.error(error);
        // Handle invalid or expired token
        res.status(400).send('Invalid or expired token');
    }
});




module.exports = router;
