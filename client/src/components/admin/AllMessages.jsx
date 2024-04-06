import React, { useState, useEffect } from "react";
import { Input, Space, Tag, Select, Dropdown, Button } from 'antd';
import { messageDp } from "../../assets";
import { Icon } from '@iconify/react';
import axios from 'axios';
import moment from 'moment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { SendOutlined, CaretDownOutlined, BellFilled } from '@ant-design/icons';

const { Search } = Input


function AllMessages() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [anchorEls, setAnchorEls] = useState({});
    const [open, setOpen] = useState(false);
    const [searchMessages, setFilteredMessages] = useState([]);
    const [groupedMessages, setGroupedMessages] = useState({});
    const [selectedUserID, setSelectedUserID] = useState(null);
    const [isSearching, setIsSearching] = useState(false);


    // Function to handle opening dropdown menu for a specific message
    const handleClick = (event, messageId) => {
        setAnchorEls({ ...anchorEls, [messageId]: event.currentTarget });
    };

    // Function to handle closing dropdown menu for a specific message
    const handleClose = (messageId) => {
        setAnchorEls({ ...anchorEls, [messageId]: null });
    };

    // Function to handle editing a message
    const editMessage = (messageId) => {
        setSelectedMessageId(messageId);
        const selectedMessage = messages.find(msg => msg._id === messageId);
        setMessage(selectedMessage.message);
    };

    //send message or update message based on selectedMessageId
    const sendMessage = async (e) => {
        e.preventDefault();
        try {
            const customerID = selectedUserID;
            const newMessage = {
                customerID,
                message,
                sendDate: moment().format("YYYY-MM-DD"),
                sendTime: moment().format("HH:mm:ss"),
                category: "Price",
                sender: "admin",
                reciverId: customerID
            };
            if (selectedMessageId) {
                // Update existing message
                await axios.put(`/api/messages/updateMessage/${selectedMessageId}`, newMessage);
            } else {
                // Send new message
                await axios.post('/api/messages/newMessage', newMessage);
            }
            // Clear input field and reset selectedMessageId after sending/editing
            setMessage("");
            setSelectedMessageId(null);
            fetchMessages();
        } catch (error) {
            console.log(error);
        }
    };

    const groupMessages = (messages) => {
        const grouped = {};
        messages.forEach((msg) => {
            if (!grouped[msg.customerID]) {
                grouped[msg.customerID] = [];
            }
            grouped[msg.customerID].push(msg);
        });
        setGroupedMessages(grouped);
        console.log(grouped)
    };


    const fetchMessages = async () => {
        try {
            const response = await axios.get('/api/messages/allMessages');
            setMessages(response.data);
            groupMessages(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);


    // Filter sent and received messages
    useEffect(() => {
        setSentMessages(messages.filter(msg => msg.sender === 'admin'));
        setReceivedMessages(messages.filter(msg => msg.sender === 'customer'));
    }, [messages]);

    // Filter unread messages
    const filterUnreadMessages = () => {
        const unreadMessages = Object.keys(groupedMessages).reduce((accumulator, customerID) => {
            const unreadMsgs = groupedMessages[customerID].filter(msg => msg.status === 'unread');
            if (unreadMsgs.length > 0) {
                accumulator[customerID] = unreadMsgs;
            }
            return accumulator;
        }, {});
        console.log("Unread Messages:", unreadMessages);
        return unreadMessages;
    };
    // Filter read messages
    const filterReadMessages = () => {
        const readMessages = Object.keys(groupedMessages).reduce((accumulator, customerID) => {
            const unreadMsgs = groupedMessages[customerID].some(msg => msg.status === 'unread');
            if (!unreadMsgs) {
                accumulator[customerID] = groupedMessages[customerID];
            }
            return accumulator;
        }, {});
        console.log("Read Messages:", readMessages);
        return readMessages;
    };


    const [selectedFilter, setSelectedFilter] = useState(null);

    const handleFilterChange = (value) => {
        setSelectedFilter(value);
    };


    let filteredMessages;
    switch (selectedFilter) {
        case '0': // Read
            filteredMessages = filterReadMessages();
            break;
        case '1': // Unread
            filteredMessages = filterUnreadMessages();
            break;
        case '2': // All
        default:
            filteredMessages = groupedMessages;
    }



    // Function to delete a message by ID
    const deleteMessage = async (messageId) => {
        try {
            // Send a DELETE request to delete the message with the specified ID
            await axios.delete(`/api/messages/deleteMessage/${messageId}`);

            // Refetch messages after deletion
            fetchMessages();

            console.log('Message deleted successfully');
        } catch (error) {
            console.log(error);
        }
    };

    const handlePreviewClick = (userID) => {
        setSelectedUserID(userID); // Set the selected user ID
        markMessagesAsRead(userID);
    };

    // Function to mark messages as read for the selected user ID
    const markMessagesAsRead = async (userID) => {
        try {
            await axios.put(`/api/messages/markMessagesAsRead/${userID}`);
            // After marking messages as read, fetch messages again to update the UI
            fetchMessages();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSearch = (value) => {
        // Convert search input to lowercase
        const searchValue = value.toLowerCase();

        // Filter messages based on search input (case-insensitive)
        const filtered = messages.filter(msg =>
            msg.message.toLowerCase().includes(searchValue)
        );

        // Map the filtered messages to the items array format
        const searchResultItems = filtered.map((msg, index) => ({
            label: msg.message, // Use the message content as the label
            key: index.toString(), // Use the index as the key
            name: msg.customerID, // Use the customer ID as the name

        }));

        // Set the filtered messages state
        setIsSearching(true);
        setFilteredMessages(searchResultItems);
        console.log(searchMessages)
    };


    // Function to handle returning from search to message-received-preview
    const handleReturnToPreview = () => {
        setFilteredMessages([]);
        setIsSearching(false);
    };


    return <div>

        <div className="message-Box-all-messages">
            <div className="message-all-users-bar">
                <div className="message-all-users-bar-top">
                    <div className="message-all-users-bar-top-msg-text" style={{ margin: "20px 0 0 40px" }}>
                        <b style={{ fontSize: "28px" }}>Messages</b>
                    </div>
                    <div style={{ margin: "35px 0 0 100px", fontSize: "12px", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <p style={{ padding: " 0 10px 0 0 ", cursor: "pointer", textDecoration: selectedFilter === "2" ? "underline" : "none" }} onClick={() => handleFilterChange("2")}>All</p>
                        <p style={{ padding: " 0 10px 0 0 ", cursor: "pointer", textDecoration: selectedFilter === "0" ? "underline" : "none" }} onClick={() => handleFilterChange("0")}>Read</p>
                        <p style={{ padding: " 0 10px 0 0 ", cursor: "pointer", textDecoration: selectedFilter === "1" ? "underline" : "none" }} onClick={() => handleFilterChange("1")}>Unread</p>
                    </div>

                </div>
                <div className="message-all-users-bar-bottom">
                    <div className="message-all-users-bar-bottom-search">
                        <Search
                            placeholder="Search messages"
                            style={{
                                width: 350,
                            }}
                            size="large"
                            onSearch={handleSearch}
                        />
                        <div className="message-group-preview">
                            {/* Render search messages if available, otherwise render grouped messages */}
                            {isSearching ? (
                                <>
                                    <Button onClick={handleReturnToPreview} style={{ margin: "0 15px 0 0", width: "350px" }}>Back to Message Preview</Button>
                                    {searchMessages.map((msg, index) => (
                                        <div key={index} className="message-received-preview" style={{ border: "1px solid #ffffff" }}>
                                            <div className="all-message-name">
                                                <div className="all-message-timeandname">
                                                    <div className="all-message-name-tag">
                                                        <b>{msg.name}</b>

                                                    </div>
                                                </div>
                                                <div>
                                                    <p>{msg.label}</p>
                                                    <Tag color="purple">price</Tag>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) :
                                (Object.keys(filteredMessages).map((customerID) => (
                                    <div key={customerID} className={`message-received-preview ${selectedUserID === customerID ? 'selected' : ''}`}
                                        onClick={() => handlePreviewClick(customerID)}>
                                        <div className="all-message-profile-pic">
                                            <img src={messageDp} alt="DP" />
                                        </div>
                                        <div className="all-message-name">
                                            <div className="all-message-timeandname">
                                                <div className="all-message-name-tag">
                                                    <b>{customerID}</b>
                                                </div>
                                                <div style={{ fontSize: "15px", color: "#b3b3b3", padding: "3px 0 0 0" }}>
                                                    {groupedMessages[customerID][0].sendTime}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "15px", color: "#b3b3b3", display: "flex", flexDirection: "row" }}>
                                                <div style={{ width: "250px" }}>{groupedMessages[customerID][groupedMessages[customerID].length - 1].message}</div>
                                                {/* Render BellFilled icon conditionally */}
                                                {groupedMessages[customerID].some(msg => msg.status === 'unread') && <BellFilled style={{ fontSize: '14px', color: 'red', }} />}
                                            </div>
                                            <div>
                                                <Tag color="purple">{groupedMessages[customerID][0].category}</Tag>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                )}
                        </div>

                    </div>
                </div>
            </div>
            <div>
                <div className="message-reply-admin">
                    <div className="message-all-users-bar-top-right">
                        <div>
                            <img src={messageDp} alt="dp" style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                margin: "15px 0 0 300px"
                            }} />
                        </div>
                        <div style={{ margin: "25px 0 0 20px" }}>
                            <b
                                style={{
                                    fontSize: "20px",
                                }}>{selectedUserID}</b>
                        </div>
                    </div>
                    <div>
                        <div className="message-reply-admin-box">
                            <div className="message-reply-admin-box-top">
                                {/* Render received and sent messages sorted by sendTime */}
                                {selectedUserID && (groupedMessages[selectedUserID] || []).map((msg, index) => (
                                    <React.Fragment key={msg._id}>
                                        {msg.sender === 'customer' ? (
                                            <div className="message-receved-admin">
                                                <img src={messageDp} alt="dp" style={{ width: "40px", height: "40px" }} />
                                                <div style={{ background: "#f1f1f1", borderRadius: "11px", margin: "0 5px 0 15px", padding: "6px", maxWidth: "400px", color: "black" }}>
                                                    <p>{msg.message}</p>
                                                </div>
                                                <div style={{ margin: "10px 0 0 5px" }}>
                                                    <div
                                                        id={`fade-button-${msg._id}`}
                                                        aria-controls={open ? 'fade-menu' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={open ? 'true' : undefined}
                                                        onClick={(e) => handleClick(e, msg._id)}
                                                    >
                                                        <Icon icon="mage:dots" width="16" height="16" style={{ cursor: "pointer" }} />
                                                    </div>
                                                    <Menu
                                                        id="fade-menu"
                                                        MenuListProps={{
                                                            'aria-labelledby': `fade-button-${msg._id}`,
                                                        }}
                                                        anchorEl={anchorEls[msg._id]}
                                                        open={Boolean(anchorEls[msg._id])}
                                                        onClose={() => handleClose(msg._id)}
                                                        TransitionComponent={Fade}
                                                        anchorOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'right',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'right',
                                                        }}
                                                        PaperProps={{
                                                            style: {
                                                                backgroundColor: 'white',
                                                                borderRadius: '8px',
                                                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem onClick={() => deleteMessage(msg._id)}>Delete</MenuItem>
                                                    </Menu>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="message-send-admin">
                                                <div style={{ margin: "10px 0 0 10px" }}>
                                                    <div
                                                        id={`fade-button-${msg._id}`}
                                                        aria-controls={open ? 'fade-menu' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={open ? 'true' : undefined}
                                                        onClick={(e) => handleClick(e, msg._id)}
                                                    >
                                                        <Icon icon="mage:dots" width="16" height="16" style={{ cursor: "pointer" }} />
                                                    </div>
                                                    <Menu
                                                        id="fade-menu"
                                                        MenuListProps={{
                                                            'aria-labelledby': `fade-button-${msg._id}`,
                                                        }}
                                                        anchorEl={anchorEls[msg._id]}
                                                        open={Boolean(anchorEls[msg._id])}
                                                        onClose={() => handleClose(msg._id)}
                                                        TransitionComponent={Fade}
                                                        anchorOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'right',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'right',
                                                        }}
                                                        PaperProps={{
                                                            style: {
                                                                backgroundColor: 'white',
                                                                borderRadius: '8px',
                                                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem onClick={() => editMessage(msg._id)}>Edit</MenuItem>
                                                        <MenuItem onClick={() => deleteMessage(msg._id)}>Delete</MenuItem>
                                                    </Menu>
                                                </div>
                                                <div style={{ background: "#7b63ff", borderRadius: "11px", margin: "0 15px 0 5px", padding: "6px", maxWidth: "400px", color: "#ffffff" }}>
                                                    <p>{msg.message}</p>
                                                </div>
                                                <img src={messageDp} alt="dp" style={{ width: "40px", height: "40px" }} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            {/* Render input field conditionally when a message is selected for editing */}
                            <div className="message-Send-bar">
                                {selectedMessageId ? (
                                    <form onSubmit={sendMessage} style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ margin: "0px 10px 2px 20px" }}>
                                            <Icon icon="mingcute:emoji-line" width="24" height="24" />
                                        </div>
                                        <Input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Edit Message"
                                            variant="borderless"
                                            style={{ width: 690 }}
                                        />
                                        <button type="submit" style={{ background: "none", border: "none", cursor: "pointer" }}>
                                            <SendOutlined style={{ color: "black", fontSize: "22px" }} />
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={sendMessage} style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ margin: "0px 10px 2px 20px" }}>
                                            <Icon icon="mingcute:emoji-line" width="24" height="24" />
                                        </div>
                                        <Input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your message here"
                                            variant="borderless"
                                            style={{ width: 690 }}
                                        />
                                        <button type="submit" style={{ background: "none", border: "none", cursor: "pointer" }}>
                                            <SendOutlined style={{ color: "black", fontSize: "22px" }} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>



                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default AllMessages;
