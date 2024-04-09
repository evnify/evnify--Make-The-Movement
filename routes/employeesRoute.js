const express = require("express");
const router = express.Router();

const employeeModel = require("../models/employee");

const generateUniquePwd = async () => {
    let id = Math.floor(10000000 + Math.random() * 90000000);
    return id;
};

const generateUniqueID = async () => {
    let id = 'E' + Math.floor(10000000 + Math.random() * 90000000);
    const existingLeave = await employeeModel.findOne({ empID: id });
    if (existingLeave) {
        return generateUniqueID();
    }
    return id;
};

router.post('/addEmployee', async (req, res) => {
    const employeeData = req.body;
    const empID = await generateUniqueID();
    const password = await generateUniquePwd();

    try {
        const existingEmployee = await employeeModel.findOne({ email: employeeData.email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Email already exists" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Database error", error: error });
    }

    employeeData.empID = empID;

    const newEmployee = new employeeModel(employeeData);
    try {
        await newEmployee.save();
        res.send("Employee added successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.get('/getAllEmployees', async (req, res) => {
    try {
        const employees = await employeeModel.find();
        res.send(employees);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post('/editEmployee', async (req, res) => {
    const employeeData = req.body;
    const empID = employeeData.empID;
    try {
        await employeeModel.findOneAndUpdate({ empID: empID }, employeeData);
        res.send("Employee updated successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post('/suspendEmployee', async (req, res) => {
    const employeeData = req.body;
    const empID = employeeData.empID;
    try {
        await employeeModel.findOneAndUpdate({ empID: empID }, { status: 'Suspended' });
        res.send("Employee suspended successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post('/activeEmployee', async (req, res) => {
    const employeeData = req.body;
    const empID = employeeData.empID;
    try {
        await employeeModel.findOneAndUpdate({ empID: empID }, { status: 'Active' });
        res.send("Employee activated successfully");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


module.exports = router;