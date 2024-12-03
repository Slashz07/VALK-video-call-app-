import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, Typography, Button } from '@mui/material';
import NavigationBar from '../Utils/NavigationBar';

function History() {
    const { getHistory } = useContext(AuthContext);
    const [meetingHistory, setMeetingHistory] = useState([]);

    useEffect(() => {
        getHistory()
            .then((userData) => {
                setMeetingHistory(userData);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <>
      <NavigationBar/>
      <div
            style={{
                backgroundColor: '#f4f4f9', // Light grayish background for a neutral feel
                color: '#333', // Dark gray for text
                minHeight: '100vh',
                padding: '20px',
                fontFamily: "'Roboto', sans-serif",
                marginTop:"8rem"
            }}
        >
            <h1
                style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#444',
                    marginBottom: '30px',
                }}
            >
                Meeting History
            </h1>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '20px',
                }}
            >
                {meetingHistory.length > 0 ? (
                    meetingHistory.map((meeting, index) => (
                        <Card
                            key={index}
                            style={{
                                backgroundColor: '#fff', // White card for clarity
                                maxWidth: '350px',
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for a subtle 3D effect
                                padding: '15px',
                                border: '1px solid #eaeaea', // Thin border for definition
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    style={{
                                        fontWeight: '600',
                                        color: '#555',
                                        marginBottom: '10px',
                                    }}
                                >
                                    Meeting Code:
                                </Typography>
                                <Typography
                                    variant="body1"
                                    style={{
                                        fontWeight: '400',
                                        marginBottom: '10px',
                                    }}
                                >
                                    {meeting.meetingCode}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    style={{
                                        fontWeight: '600',
                                        color: '#555',
                                        marginBottom: '10px',
                                    }}
                                >
                                    Meeting Date:
                                </Typography>
                                <Typography
                                    variant="body1"
                                    style={{
                                        fontWeight: '400',
                                    }}
                                >
                                    {new Date(meeting.date).toLocaleString()}
                                </Typography>
                            </CardContent>
                          
                        </Card>
                    ))
                ) : (
                    <h2
                        style={{
                            textAlign: 'center',
                            color: '#666', // Muted gray for no-data message
                        }}
                    >
                        No meetings joined in the past 2 days!
                    </h2>
                )}
            </div>
        </div>
      </>
    );
}

export default History;
