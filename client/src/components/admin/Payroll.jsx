import React, { useEffect, useState, useRef } from "react";
import {
    Input,
    Modal,
    DatePicker,
    Select,
    Radio,
    Space,
    Divider,
    Button,
    message,
} from "antd";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Search } = Input;

function Payroll() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("all");

    // Create model content
    const [empName, setEmpName] = useState("");
    const [type, setType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [basicSalary, setBasicSalary] = useState("");
    const [allowances, setAllowances] = useState([]);
    const [deductions, setDeductions] = useState([]);
    const [empID, setEmpID] = useState("");
    const [totalSalary, setTotalSalary] = useState(0);
    const inputRef = useRef(null);
    const [deductionSelect, setDeductionSelect] = useState([
        "Social security deduction",
        "Income tax",
        "Health insurance deduction",
        "Loan deduction",
        "Other deduction",
    ]);
    const [allowanceSelect, setAllowanceSelect] = useState([
        "Performance Bonus",
        "Transport Allowance",
        "Medical Allowance",
        "Anual Bonus",
        "Profit Share",
    ]);
    const [deductionName, setDeductionName] = useState("");
    const [deductionLabel, setDeductionLabel] = useState("");
    const [allowanceName, setAllowanceName] = useState("");
    const [allowanceLabel, setAllowanceLabel] = useState("");
    const [deductionAmount, setDeductionAmount] = useState("");
    const [allowanceAmount, setAllowanceAmount] = useState("");

    let index = 0;

    const addDeduction = (e) => {
        e.preventDefault();
        setDeductionSelect((prevState) => [
            ...prevState,
            deductionLabel || `New item ${index++}`,
        ]);
        setDeductionLabel("");
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };


    const addAllowance = (e) => {
        e.preventDefault();
        setAllowanceSelect((prevState) => [
            ...prevState,
            allowanceLabel || `New item ${index++}`,
        ]);
        setAllowanceLabel("");
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const newDeduction = (e) => {
        e.preventDefault();
        if (deductionName === "" || deductionName === null)
            return message.error("Please enter deduction name");
        else if (deductionAmount === "" || deductionAmount === null)
            return message.error("Please enter deduction amount");
        else {
            setDeductions((prevState) => [
                ...prevState,
                { name: deductionName, amount: deductionAmount },
            ]);
            setDeductionName("");
            setDeductionAmount("");
        }
    };

    const newAllowance = (e) => {
        e.preventDefault();
        if (allowanceName === "" || allowanceName === null)
            return message.error("Please enter allowance name");
        else if (allowanceAmount === "" || allowanceAmount === null)
            return message.error("Please enter allowance amount");
        else {
            setAllowances((prevState) => [
                ...prevState,
                { name: allowanceName, amount: allowanceAmount },
            ]);
            setAllowanceName("");
            setAllowanceAmount("");
        }
    };

    //Retrieve All Employee Details
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        // Fetch all employees
        async function fetchEmployeeList() {
            const response = await axios.get(
                `${process.env.PUBLIC_URL}/api/employees/getEmployees`
            );
            setEmployees(response.data);
        }
        fetchEmployeeList();
    }, []);

    // Calculate total Salary
    useEffect(() => {
        let total = 0;
        if (basicSalary === "") {
          setTotalSalary(0);
        }else{

        allowances.forEach((allowance) => {
            total += parseInt(allowance.amount);
        });
        deductions.forEach((deduction) => {
            total -= parseInt(deduction.amount);
        });
        total += parseInt(basicSalary);
        setTotalSalary(total);
        }
    }, [allowances, deductions, basicSalary]);

    // Create Employee Dropdown Data
    const empData = employees.map((employee) => ({
        value: employee.empID,
        label: `${employee.firstName} ${employee.lastName}`,
        type: employee.type,
    }));

    const handleEmployeeSelect = (selectedValue, selectedOption) => {
        setType(selectedOption.type);
        setEmpID(selectedOption.value);
    };

    const onSearch = (value) => console.log(value);

    const SaveSalary = () => {
        console.log("Save Salary");
    };

    return (
        <div>
            {/* Create Pay sheet model */}
            <Modal
                footer={null}
                title="Create New Paysheet"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                centered
            >
                <div className="create_paysheet_002">
                    <div>
                        <div
                            style={{
                                marginTop: "8px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <span
                                style={{
                                    marginBottom: "3px",
                                    fontSize: "14px",
                                }}
                            >
                                Select an Employee
                            </span>
                            <Select
                                showSearch
                                style={{
                                    width: 200,
                                    height: 40,
                                }}
                                placeholder="Search Employee"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "").includes(input)
                                }
                                filterSort={(optionA, optionB) =>
                                    (optionA?.label ?? "")
                                        .toLowerCase()
                                        .localeCompare(
                                            (optionB?.label ?? "").toLowerCase()
                                        )
                                }
                                onChange={handleEmployeeSelect}
                                options={empData}
                            />
                        </div>
                        <div
                            style={{
                                marginTop: "8px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <span
                                style={{
                                    marginBottom: "3px",
                                    fontSize: "14px",
                                }}
                            >
                                Type
                            </span>
                            <Input
                                disabled
                                type="text"
                                size="large"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                        </div>
                        <div
                            style={{
                                marginTop: "8px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <span
                                style={{
                                    marginBottom: "3px",
                                    fontSize: "12px",
                                }}
                            >
                                From Date
                            </span>
                            <DatePicker
                                style={{
                                    width: 205,
                                    height: 40,
                                }}
                                defaultValue={fromDate ? moment(fromDate) : null}
                                onChange={(date, dateString) => {
                                    setToDate(dateString);
                                }}
                            />
                        </div>
                    </div>
                    <div className="admin_payroll_table_right_side_002">
                        <div className="admin_payroll_table_right_side_002_top_div">
                            <div
                                style={{
                                    marginTop: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <span
                                    style={{
                                        marginBottom: "3px",
                                        fontSize: "14px",
                                    }}
                                >
                                    Emp ID
                                </span>
                                <Input
                                    disabled
                                    type="text"
                                    size="large"
                                    value={empID}
                                />
                            </div>
                            <div
                                style={{
                                    marginTop: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <span
                                    style={{
                                        marginBottom: "3px",
                                        fontSize: "14px",
                                    }}
                                >
                                    Basic salary
                                </span>
                                <Input
                                    type="text"
                                    size="large"
                                    placeholder="Enter Salary"
                                    value={basicSalary}
                                    onChange={(e) =>
                                        setBasicSalary(e.target.value)
                                    }
                                />
                            </div>
                            <div
                                style={{
                                    marginTop: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <span
                                    style={{
                                        marginBottom: "3px",
                                        fontSize: "12px",
                                    }}
                                >
                                    To Date
                                </span>
                                <DatePicker
                                    style={{
                                        width: 205,
                                        height: 40,
                                    }}
                                    defaultValue={toDate ? moment(toDate) : null}
                                    onChange={(date, dateString) => {
                                        setToDate(dateString);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <span
                        style={{
                            marginBottom: "3px",
                            fontSize: "14px",
                        }}
                    >
                        Allowances
                    </span>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                        }}
                    >
                        <Select
                            style={{
                                width: 220,
                                height: 35,
                            }}
                            value={allowanceName}
                            onChange={(value) => {
                                setAllowanceName(value);
                            }}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider
                                        style={{
                                            margin: "8px 0",
                                        }}
                                    />
                                    <Space
                                        style={{
                                            padding: "0 8px 4px",
                                        }}
                                    >
                                        <Input
                                            placeholder="Please enter item"
                                            ref={inputRef}
                                            value={allowanceLabel}
                                            onChange={(e) =>
                                                setAllowanceLabel(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                e.stopPropagation()
                                            }
                                        />
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={addAllowance}
                                        >
                                            Add item
                                        </Button>
                                    </Space>
                                </>
                            )}
                            options={allowanceSelect.map((item) => ({
                                label: item,
                                value: item,
                            }))}
                        />
                        <Input
                            placeholder="Amount"
                            style={{
                                width: 120,
                                marginRight: 10,
                                height: 35,
                            }}
                            type="number"
                            value={allowanceAmount}
                            onChange={(e) => setAllowanceAmount(e.target.value)}
                        />
                        <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={newAllowance}
                        >
                            Add
                        </Button>
                    </div>
                    {allowances.map((allowance, index) => (
                        <div key={index}>
                            <Input
                                value={Object.values(allowance)[0]}
                                style={{
                                    width: 220,
                                    marginRight: 20,
                                    height: 35,
                                    marginTop: 10,
                                }}
                                disabled
                            />
                            <Input
                                value={Object.values(allowance)[1] + " LKR"}
                                style={{
                                    width: 120,
                                    marginRight: 10,
                                    height: 35,
                                }}
                                disabled
                            />
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        marginTop: "8px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <span
                        style={{
                            marginBottom: "1px",
                            fontSize: "14px",
                        }}
                    >
                        Deductions
                    </span>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                        }}
                    >
                        <Select
                            style={{
                                width: 220,
                                height: 35,
                            }}
                            value={deductionName}
                            onChange={(value) => {
                                setDeductionName(value);
                            }}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider
                                        style={{
                                            margin: "8px 0",
                                        }}
                                    />
                                    <Space
                                        style={{
                                            padding: "0 8px 4px",
                                        }}
                                    >
                                        <Input
                                            placeholder="Please enter item"
                                            ref={inputRef}
                                            value={deductionLabel}
                                            onChange={(e) =>
                                                setDeductionLabel(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                e.stopPropagation()
                                            }
                                        />
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={addDeduction}
                                        >
                                            Add item
                                        </Button>
                                    </Space>
                                </>
                            )}
                            options={deductionSelect.map((item) => ({
                                label: item,
                                value: item,
                            }))}
                        />
                        <Input
                            placeholder="Amount"
                            style={{
                                width: 120,
                                marginRight: 10,
                                height: 35,
                            }}
                            type="number"
                            value={deductionAmount}
                            onChange={(e) => setDeductionAmount(e.target.value)}
                        />
                        <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={newDeduction}
                        >
                            Add
                        </Button>
                    </div>
                    {deductions.map((deduction, index) => (
                        <div key={index}>
                            <Input
                                value={Object.values(deduction)[0]}
                                style={{
                                    width: 220,
                                    marginRight: 20,
                                    height: 35,
                                    marginTop: 10,
                                }}
                                disabled
                            />
                            <Input
                                value={Object.values(deduction)[1] + " LKR"}
                                style={{
                                    width: 120,
                                    marginRight: 10,
                                    height: 35,
                                }}
                                disabled
                            />
                        </div>
                    ))}
                </div>

                <h5 className=" total_salary_002">Total Salary : {totalSalary} LKR</h5>
                <div className="center">
                <button
                    className="salary_save_btn_002"
                    onClick={SaveSalary}
                    style={{
                        width: "120px",
                        height: "40px",
                    }}
                >
                    Save Salary
                </button>
                <button
                    className="salary_cansel_btn_002"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        width: "120px",
                        height: "40px",
                    }}
                >
                    Cancel
                </button>
                </div>
            </Modal>
            <div className="admin_emp_list_container">
                <div className="admin_emp_list_top_menu">
                    <div
                        style={{
                            marginRight: "auto",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <h5>Recent Salaries</h5>
                        <Search
                            placeholder="Search by Name"
                            size="large"
                            onSearch={onSearch}
                            style={{
                                width: 265,
                                height: 40,
                            }}
                        />
                    </div>
                    <div style={{ marginLeft: "auto", alignItems: "center" }}>
                        <Radio.Group
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                            }}
                            size="large"
                            style={{
                                width: 250,
                            }}
                        >
                            <Radio.Button value="all">All</Radio.Button>
                            <Radio.Button value="Paid">Paid</Radio.Button>
                            <Radio.Button value="Pending">Pending</Radio.Button>
                        </Radio.Group>
                        <button
                            className="admin_emp_list_top_menu_button"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M8.5 2.75C8.5 2.55109 8.42098 2.36032 8.28033 2.21967C8.13968 2.07902 7.94891 2 7.75 2C7.55109 2 7.36032 2.07902 7.21967 2.21967C7.07902 2.36032 7 2.55109 7 2.75V7H2.75C2.55109 7 2.36032 7.07902 2.21967 7.21967C2.07902 7.36032 2 7.55109 2 7.75C2 7.94891 2.07902 8.13968 2.21967 8.28033C2.36032 8.42098 2.55109 8.5 2.75 8.5H7V12.75C7 12.9489 7.07902 13.1397 7.21967 13.2803C7.36032 13.421 7.55109 13.5 7.75 13.5C7.94891 13.5 8.13968 13.421 8.28033 13.2803C8.42098 13.1397 8.5 12.9489 8.5 12.75V8.5H12.75C12.9489 8.5 13.1397 8.42098 13.2803 8.28033C13.421 8.13968 13.5 7.94891 13.5 7.75C13.5 7.55109 13.421 7.36032 13.2803 7.21967C13.1397 7.07902 12.9489 7 12.75 7H8.5V2.75Z"
                                    fill="white"
                                />
                            </svg>{" "}
                            &nbsp; Create{" "}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payroll;
