import React, { useState, useEffect } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Doughnut } from "react-chartjs-2"; // Added Bar import
import { Column } from "@ant-design/plots";

import UserTab from "./UserTab";

import {
    ConfigProvider,
    Modal,
    Select,
    DatePicker,
    Input,
    Button,
    Radio,
    Divider,
    Space,
    message,
    Upload,
    Table,
    columns,
    Tag,
    Avatar,
} from "antd";

import axios from "axios";
import Loader from "./Loader";
import Link from "antd/es/typography/Link";

let index = 0;

const { Search, TextArea } = Input;

function UsersInsights() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUserList = async () => {
        try {
            const response = await axios.get("/api/users/getUser");
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUserList();
    }, []);

    const columns = [
        {
            title: "user_ID",
            dataIndex: "userID",
            key: "userID",
        },
        {
            title: "",
            dataIndex: "profilePic",
            key: "profilePic",
            render: (_, record) => (
                <Avatar size={35} src={record.profilePic} alt="avatar" />
            ),
        },
        {
            title: "username",
            dataIndex: "username",
            key: "username",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Phone Number",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
        },
        {
            title: "Email Address",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Type",
            dataIndex: "userType",
            key: "userType",
        },
        {
            title: "Status",
            key: "status",
            dataIndex: "status",
            render: (status) => {
                let color = "green";
                if (status === "Suspended") {
                    color = "red";
                }
                return (
                    <Tag color={color}>
                        {status ? status.toUpperCase() : ""}
                    </Tag>
                );
            },
        },
        {
            title: "Address",
            dataIndex: "address1",
            key: "address1",
        },
    ];

    const chartData = {
        labels: ["Red", "Blue", "Yellow"],
        datasets: [
            {
                label: "My First Dataset",
                data: [300, 50, 100],
                backgroundColor: [
                    "rgb(255, 99, 132)",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)",
                ],
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                display: false, // Hide the legend
            },
        },
    };

    const config = {
        data: {
            type: "fetch",
            value: "https://render.alipay.com/p/yuyan/180020010001215413/antd-charts/column-column.json",
        },
        xField: "letter",
        yField: "frequency",
        label: {
            text: (d) => `${(d.frequency * 100).toFixed(1)}%`,
            textBaseline: "bottom",
        },
        axis: {
            y: {
                labelFormatter: ".0%",
            },
        },
        style: {
            radiusTopLeft: 10,
            radiusTopRight: 10,
        },
    };

    return (
        <>
            <div className="UsersInsights">
                <UserTab />
            </div>
            <div className="chart_container">
                <div className="admin_user_chart1">
                    <div className="chart_title">
                        <h3>Users Insights</h3>
                        <p>Users Insights</p>
                    </div>
                    <div className="bar_chart">
                        <Column {...config} />
                    </div>
                </div>

                <div className="admin_user_chart2">
                    <div className="chart_title">
                        <h3>Users Insights</h3>
                        <p>Users Insights</p>
                    </div>
                    <div className="chart-container">
                        <Doughnut data={chartData} options={options} />
                        <div className="chart-legend">
                            {chartData.labels.map((label, index) => (
                                <div key={index} className="legend-item">
                                    <div
                                        className="legend-color"
                                        style={{
                                            backgroundColor:
                                                chartData.datasets[0]
                                                    .backgroundColor[index],
                                        }}
                                    ></div>
                                    <div className="legend-label">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin_user_bar">
                <h3>Recent Users</h3>
                <div className="admin_user_bar1"></div>
                <Link
                    href="/admin/users"
                    className="admin_user_bar2 "
                    style={{ padding: "10px" }}
                >
                    View All
                </Link>
            </div>
            <div className="admin_user_list">
                <div style={{ width: "100%" }}>
                    <div className="row">
                        {loading && <Loader />}
                        <div className="col-md-12">
                            <Table
                                dataSource={data}
                                columns={columns}
                                pagination={{
                                    pageSize: 7,
                                    hideOnSinglePage: true,
                                }}
                                footer={() => (
                                    <div className="footer-number">{`Total ${data.length} items`}</div>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UsersInsights;
