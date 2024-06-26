const express = require("express");
require("dotenv").config();
const path = require("path");
const app = express();
const cors = require("cors");
const authRoute = require("./routes/usersRoute");
const dbConfig = require("./db");


const usersRoute = require("./routes/usersRoute");
const bookingsRoute = require("./routes/bookingsRoute");
const packagesRoute = require("./routes/packagesRoute");
const employeesRoute = require("./routes/employeesRoute");
const leaveRoute = require("./routes/leaveRoute");
const blogRoute = require("./routes/blogRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const messagesRoute = require("./routes/messagesRoute");
const paymentRoute = require("./routes/paymentRoute");
const salaryRoute = require("./routes/salaryRoute");
const emailRoute = require("./routes/emailRoute");
const viewCountRoute = require("./routes/viewCountRoute");
const pkgViewCountRoute = require("./routes/pkgViewCountRoute");
const cookieSession = require("cookie-session");

app.use(express.json());

app.use("/api/users", usersRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/packages", packagesRoute);
app.use("/api/employees", employeesRoute);
app.use("/api/leaves", leaveRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/inventories", inventoryRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/salary", salaryRoute);
app.use("/auth", authRoute);
app.use("/api/emails", emailRoute);
app.use("/api/viewCounts", viewCountRoute);
app.use("/api/pkgViewCounts", pkgViewCountRoute);



app.options('*', cors());

const port = process.env.PORT || 5000;

app.listen(port, () =>
    console.log(`Server running on port ${port} with nodemon`)
);
