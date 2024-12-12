import React, { useEffect, useRef, useState } from 'react'
import "../styles/VideoCall.css"
import Button from '@mui/material/Button';
import io from "socket.io-client";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import VideoOnIcon from '@mui/icons-material/Videocam';
import VideoOffIcon from '@mui/icons-material/VideocamOff';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import { useNavigate } from 'react-router-dom';
import { TextField, Typography, IconButton, Badge, ListItem, List, ListItemText } from '@mui/material';
import NavigationBar from '../Utils/NavigationBar';
import isBackendProd from '../Environment';

const server_url = isBackendProd(true)

let connections = {}

const peerConfigConnections = {
  "iceServers": [
    // {
    //   "urls": "stun:stun.l.google.com:19302"
    // },
    {
      "urls": "turn:relay1.expressturn.com:3478",
      "username": "efQTT5F1GUVGQAR40F",
      "credential": "izT9LjQwzi8IVw81"
    }
  ]
}

function VideoCall() {

  const socketRef = useRef()
  const socketIdRef = useRef()
  const localVideoRef = useRef()
  const videoRef = useRef([])

  const [videoAvailable, setVideoAvailable] = useState(false)
  const [audioAvailable, setAudioAvailable] = useState(false)

  const [video, setVideo] = useState()
  const [audio, setAudio] = useState()
  const [screen, setScreen] = useState()

  const [showModal, setShowModal] = useState()
  const [messages, setMessages] = useState([])
  const [screenAvailable, setScreenAvailable] = useState()
  const [message, setMessage] = useState("")
  const [unseenMessages, setUnseenMessages] = useState(0)
  const [askUsername, setAskUsername] = useState(true)

  const [username, setUsername] = useState("")
  const [allVideos, setAllVideos] = useState([])

  const [videoPermission, setVideoPermission] = useState(false)
  const [audioPermission, setAudioPermission] = useState(false)
  const [videoSize, setVideoSize] = useState({ maxWidth: '45%' })
  const [front, setFront] = useState(1);
  const [rearCameraAvailable, setRearCameraAvailable] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    const updateVideoSize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth <= 560) {
        // Adjust sizes for smaller screens
        if (allVideos.length === 1) {
          setVideoSize({ maxWidth: '90%' });
        } else if (allVideos.length === 2) {
          setVideoSize({ maxWidth: '80%' });
        }
        else {
          // setTwoUserStyle({})
          setVideoSize({ maxWidth: '70%' });
        }
      } else {
        // Default sizes for larger screens
        // setTwoUserStyle({})
        if (allVideos.length === 1) {
          setVideoSize({ maxWidth: '45%' });
        } else if (allVideos.length === 2) {
          setVideoSize({ maxWidth: '35%' });
        } else {
          setVideoSize({ maxWidth: '30%' });
        }
      }
    };

    updateVideoSize(); // Initial call
    window.addEventListener('resize', updateVideoSize); // Update on resize

    return () => window.removeEventListener('resize', updateVideoSize); // Cleanup
  }, [allVideos.length]);


  const configurations = async () => {

    try {
      const videoPermit = await navigator.mediaDevices.getUserMedia({ video: true })
      setVideoPermission(videoPermit)
      setVideoAvailable(true)
    } catch (error) {
      setVideoAvailable(false)
    }
    try {
      const audioPermit = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioPermission(audioPermit)
      setAudioAvailable(true)
    } catch (error) {
      setAudioAvailable(false)
    }


    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true)
    } else {
      setScreenAvailable(false)
    }

    //setting status about rear/multiple camera availibility
    const isAvailable = await rearCamera()
    setRearCameraAvailable(isAvailable)


    navigator.mediaDevices.addEventListener('devicechange', configurations)

    const cameraPermissionStatus = await navigator.permissions.query({ name: 'camera' });
    cameraPermissionStatus.onchange = async () => {
      if (cameraPermissionStatus.state === "granted") {
        const updatedVideoPermit = await navigator.mediaDevices.getUserMedia({ video: true })
        setVideoPermission(updatedVideoPermit)
        setVideoAvailable(true);
      } else {
        setVideoPermission(false)
        setVideoAvailable(false);
      }

    }

    const microphonePermissionStatus = await navigator.permissions.query({ name: 'microphone' });
    microphonePermissionStatus.onchange = async () => {
      if (microphonePermissionStatus.state === "granted") {
        const updatedAudioPermit = await navigator.mediaDevices.getUserMedia({ audio: true })
        setAudioPermission(updatedAudioPermit)
        setAudioAvailable(true);
      } else {
        setAudioPermission(false)
        setAudioAvailable(false);
      }

    };
  }


  const getPermissions = async () => {
    const combinedStream = new MediaStream

    if (videoAvailable) {
      videoPermission && videoPermission?.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track)
      });
    }
    console.log("hi\n", "video permission", videoPermission, "\nAudio permission: ", audioPermission)

    console.log(videoAvailable)
    console.log(audioAvailable)
    if (audioAvailable) {
      audioPermission && audioPermission?.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track)
      });

    }
    if (videoAvailable || audioAvailable) {
      window.localStream = combinedStream
    } else {
      window.localStream = null
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = combinedStream
    }

    // if (videoAvailable || audioAvailable) {
    //   const mediaStreams = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })//this does generate another prompt asking for permissions because the browser stores user's response from above permissions for the current sessin and so when this request is made it simply provides the stored response
    //   if (mediaStreams) {
    //     window.localStream = mediaStreams
    //     if (localVideoRef.current) {
    //       localVideoRef.current.srcObject = mediaStreams
    //     }
    //   }
    // }


  }

  const silence = () => {
    const ctx = new AudioContext()
    const oscilator = ctx.createOscillator()//create a oscillator node that generates sound like sine wave
    const dst = oscilator.connect(ctx.createMediaStreamDestination())// ctx.createMediaStreamDestination here produces a mediaStreamDestination node which acts as a destination for audio which is then processed into a MediaStream containing that audio,Oscillator.connect here provides the audio like sine wave produced by the oscillator to mediaStreamNode,and dst here recieves this mediaStreamNode and we can access the stream from it as dst.stream

    oscilator.start()//The oscillator starts generating its waveform
    ctx.resume()//Ensures the AudioContext is active and running. Some browsers require explicit resumption of the AudioContext if it's in a suspended state.
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })//{ enabled: false } mutes the audio track generated by the oscillator. Even though the oscillator is actively producing sound, the audio track is effectively disabled.
  }


  let black = ({ height = 480, width = 640 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { height, width })
    canvas.getContext("2d").fillRect(0, 0, width, height)
    const stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }


  const getDeviceStreamsSuccess = (stream) => {

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }
      //completely remove the previous tracks ,before adding newones
      if (connections[id]) {
        const senders = connections[id].getSenders();
        senders.forEach((sender) => {
          if (sender.track && !window.localStream.getTracks().includes(sender.track)) {
            connections[id].removeTrack(sender);
          }
        });
      }


      try {
        const mediaOrder = ["audio", "video"];
        mediaOrder.forEach((type) => {
          const tracks = window.localStream.getTracks().filter((track) => track.kind === type);
          tracks.forEach((track) => connections[id].addTrack(track, window.localStream));
        });
      } catch (error) {
        console.log(error)

      }


      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }))
        }).catch((err) => console.log(err))
      }).catch((err) => console.log(err))
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setAudio(false)
      setVideo(false)

      try {
        const tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      } catch (error) {
        console.log(error)
      }

      let blackSilence = (...args) => (
        new MediaStream([black(...args), silence()])
      )


      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream

      for (let id in connections) {

        if (id === socketIdRef.current) continue;
        //completely remove the previous tracks ,before adding newones
        if (connections[id]) {
          const senders = connections[id].getSenders();
          senders.forEach((sender) => {
            if (sender.track && !window.localStream.getTracks().includes(sender.track)) {
              connections[id].removeTrack(sender);
            }
          });
        }

        try {
          const mediaOrder = ["audio", "video"];
          mediaOrder.forEach((type) => {
            const tracks = window.localStream.getTracks().filter((track) => track.kind === type);
            tracks.forEach((track) => connections[id].addTrack(track, window.localStream));
          });
        } catch (error) {
          console.log(error)
        }

        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description).then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }))
          })
        }).catch((err) => console.log(err));

      }

    })


  }

  const getDeviceStreams = () => {
    try {
      console.log("getDeviceStreams has been called")
      if (video && videoAvailable || audio && audioAvailable) {

        window.localStream.getTracks().forEach((track) => track.stop())
        window.localStream = null;

        if (front) {
          navigator.mediaDevices.getUserMedia({ audio, video: video ? { facingMode: "user" } : video })
            .then(getDeviceStreamsSuccess)
            .then((stream) => { })
            .catch((err) => {
              console.log(err)
            })

        } else {
          navigator.mediaDevices.getUserMedia({ audio, video: video ? { facingMode: "environment" } : video })
            .then(getDeviceStreamsSuccess)
            .then((stream) => { })
            .catch((err) => {
              console.log(err)
            })
        }

      } else {
        console.log("stream deletion occuring")
        window.localStream.getTracks().forEach(track => {
          track.stop()
        });
        const player = localVideoRef.current?.srcObject
        const tracks = player ? player.getTracks() : []//since in case user doesnt give any permission the srcObject doesnt have tracks and srcObject.getTracks() will throw error
        tracks.length > 0 && tracks.forEach((track) => track.stop())

        let blackSilence = (...args) => (
          new MediaStream([black(...args), silence()])
        )

        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream

        for (let id in connections) {
          //completely remove the previous tracks ,before adding newones
          if (connections[id]) {
            const senders = connections[id].getSenders();
            senders.forEach((sender) => {
              if (sender.track && !window.localStream.getTracks().includes(sender.track)) {
                connections[id].removeTrack(sender);
              }
            });
          }

          if (id === socketIdRef.current) continue;

          try {
            const mediaOrder = ["audio", "video"];
            mediaOrder.forEach((type) => {
              const tracks = window.localStream.getTracks().filter((track) => track.kind === type);
              tracks.forEach((track) => connections[id].addTrack(track, window.localStream));
            });
          } catch (error) {
            console.log(error)

          }

          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description).then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }))
            })
          }).catch((err) => console.log(err));

        }
      }
    } catch (error) {
      console.log(error)
    }
  }
  const pendingCandidates = {}; // Store candidates until the remote description is set

  const messageFromServer = (fromId, message) => {
    console.log("Signal message received");
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            // Handle SDP offer
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  return connections[fromId].setLocalDescription(description);
                })
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({ sdp: connections[fromId].localDescription })
                  );
                })
                .catch((err) => console.log("Error creating answer:", err));
            }

            // Add pending ICE candidates
            if (pendingCandidates[fromId]) {
              pendingCandidates[fromId].forEach((candidate) => {
                connections[fromId].addIceCandidate(candidate).catch((err) => {
                  console.log("Error adding pending ICE candidate:", err);
                });
              });
              delete pendingCandidates[fromId];
            }
          })
          .catch((err) => console.log("Error setting remote description:", err));
      }

      if (signal.ice) {
        const candidate = new RTCIceCandidate(signal.ice);
        if (connections[fromId].remoteDescription) {
          connections[fromId].addIceCandidate(candidate).catch((err) => {
            console.log("Error adding ICE candidate:", err);
          });
        } else {
          // Queue the candidate if the remote description is not set
          if (!pendingCandidates[fromId]) {
            pendingCandidates[fromId] = [];
          }
          pendingCandidates[fromId].push(candidate);
        }
      }
    }
  };


  const addMessage = (data, sender, senderSocketId) => {
    console.log("message recieved")
    setMessages((prevMessages) => [
      ...prevMessages,
      { data, sender, senderSocketId }
    ])

    if (senderSocketId !== socketIdRef.current) {
      setUnseenMessages((unseenCount) => unseenCount + 1)
    }
  }

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false })

    socketRef.current.on("signal", messageFromServer)

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href)
      socketIdRef.current = socketRef.current.id
      socketRef.current.on("chat-message", addMessage)

      socketRef.current.on("user-left", (id) => {
        console.log("user left ran")
        setAllVideos((userVideos) => userVideos.filter((userVideo) => userVideo.socketId !== id))
      })
      const receivedTracks = {};

      // Inside the "user-joined" event
      socketRef.current.on("user-joined", (id, users) => {

        users.forEach((socketId) => {
          connections[socketId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketId].ontrack = (event) => {
            console.log("ontrack is running");
            console.log("track revcieved+ ", event.track.id)

            // Initialize tracking for this socketId if not already done
            if (!receivedTracks[socketId]) {
              receivedTracks[socketId] = new Set();
            }

            // Add the track ID to the Set
            receivedTracks[socketId].add(event.track.id);

            const stream = event.streams[0];

            // Check if all expected tracks for this stream have been received
            if (stream.getTracks().every((track) => receivedTracks[socketId].has(track.id))) {
              // Create or update the video object
              const videoExists = videoRef.current.find((video) => video.socketId === socketId);
              if (videoExists) {
                setAllVideos((videos) => {
                  const updatedVideos = videos.map((video) =>
                    video.socketId === socketId ? { ...video, stream: stream } : video
                  );
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              } else {
                const newVideo = {
                  socketId: socketId,
                  stream: stream,
                  autoPlay: true,
                  playsinline: true,
                };

                setAllVideos((videos) => {
                  const updatedVideos = [...videos, newVideo];
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              }
            }
          };


          if (window.localStream !== undefined || window.localStream !== null) {
            console.log("reached adding stream")
            // connections[socketId].addStream(window.localStream)
            // Add all tracks from the local stream to the peer connection
            console.log(window.localStream.getTracks());

            try {
              const mediaOrder = ["audio", "video"];
              mediaOrder.forEach((type) => {
                const tracks = window.localStream.getTracks().filter((track) => track.kind === type);
                tracks.forEach((track) => connections[socketId].addTrack(track, window.localStream));
              });
            } catch (error) {
              console.log(error)

            }
          } else {
            // blackSilence()

            let blackSilence = (...args) => (
              new MediaStream([black(...args), silence()])
            )

            window.localStream = blackSilence();
            // connections[socketId].addStream(window.localStream)
            if (window.localStream) {
              // Add all tracks from the local stream to the peer connection
              try {
                const mediaOrder = ["audio", "video"];
                mediaOrder.forEach((type) => {
                  const tracks = window.localStream.getTracks().filter((track) => track.kind === type);
                  tracks.forEach((track) => connections[socketId].addTrack(track, window.localStream));
                });
              } catch (error) {
                console.log(error)

              }
            }

          }


        });


        if (socketIdRef.current === id) {//i.e if the id of the client whose system this frontend code is running upon is the same as the one that currently joined the room which sends the message "user-joined" 
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) {
              continue
            }

            try {
              const mediaOrder = ["audio", "video"];
              mediaOrder.forEach((type) => {
                const tracks = window.localStream.getTracks().filter((track) => track.kind === type);

                // Check if the track is already added
                tracks.forEach((track) => {
                  const senders = connections[id2].getSenders();
                  const trackAlreadyAdded = senders.some(sender => sender.track === track);


                  if (!trackAlreadyAdded) {
                    connections[id2].addTrack(track, window.localStream);
                  }
                });
              });
            } catch (error) {
              console
            }

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => { socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription })) })//sdp-->session description
                .catch((error) => console.log(error))
            })

          }

        }

      })
    })
  }

  useEffect(() => {
    try {
      configurations()
    } catch (error) {
      console.log(error)
    }
  }, [])


  useEffect(() => {
    try {
      getPermissions()
    } catch (error) {
      console.log(error)
    }
  }, [videoAvailable, audioAvailable, videoPermission, audioPermission])


  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getDeviceStreams()
    }
  }, [audio, video, front])

  const getScreenMediaSuccess = (stream) => {
    window.localStream.getTracks().forEach((track) => track.stop())

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }

      //completely remove the previous tracks ,before adding newones
      if (connections[id]) {
        const senders = connections[id].getSenders();
        senders.forEach((sender) => {
          if (sender.track && !window.localStream.getTracks().includes(sender.track)) {
            connections[id].removeTrack(sender);
          }
        });
      }

      try {
        const mediaOrder = ["audio", "video"];
        mediaOrder.forEach((type) => {
          const tracks = window.localStream.getTracks().filter((track) => track.kind === type);
          tracks.forEach((track) => connections[id].addTrack(track, window.localStream));
        });
      } catch (error) {
        console.log(error)
      }

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }))
        }).catch((err) => console.log(err))
      }).catch((err) => console.log(err))

    }


    // when screen sharing is turned off==>

    window.localStream.getTracks().forEach(track => {
      track.onended = () => {
        setScreen(false)
        console.log("onended is called")
        try {
          localVideoRef.current.srcObject.getTracks().forEach((track => track.stop()))
        } catch (error) {
          console.log(error)
        }

        let blackSilence = (...args) => {
          return new MediaStream([black(...args), silence()])
        }

        window.localStream = blackSilence()
        localVideoRef.current.srcObject = window.localStream

        getDeviceStreams()

      }
    })

  }

  const getScreenMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getScreenMediaSuccess)//once promise is resolved the fuiction is called with the recieved argument
          .then((stream) => { })
          .catch(err => console.log(err))

      }
    } else {
      setScreen(false)
      try {
        localVideoRef.current.srcObject.getTracks().forEach((track => track.stop()))
      } catch (error) {
        console.log(error)
      }


      let blackSilence = (...args) => (
        new MediaStream([black(...args), silence()])
      )
      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream

      getDeviceStreams()



    }
  }

  const rearCamera = async () => {
    const inputDevices = await navigator.mediaDevices.enumerateDevices();
    const cameraDevices = inputDevices.filter((device) => device.kind === "videoinput");
    const isRearAvail=cameraDevices.some((device)=>device.label.indexOf("facing back")!==-1)
    if (isRearAvail) {
      return true;
    } else {
      return false;
    }

  }

  useEffect(() => {
    if (screen != undefined) {
      getScreenMedia()
    }
  }, [screen])

  const getMedia = async () => {
    setVideo(videoAvailable)
    setAudio(audioAvailable)
    connectToSocketServer()
  }

  const connect = async () => {
    await getMedia()
    setAskUsername(false)

  }

  const sendMessage = () => {
    console.log("sending mesage");
    socketRef.current.emit("chat-message", message, username)
    setMessage("")
  }


  const endCall = () => {
    try {
      const streamTracks = window.localStream.getTracks()
      streamTracks.forEach((track) => track.stop())

      const userTracks = localVideoRef.current.srcObject.getTracks()
      userTracks && userTracks.forEach((track) => track.stop())


      socketRef.current.disconnect()
    } catch (error) {
      console.log(error)
    }
    navigate("/home")
  }


  return (
    <div className="video-app">
      {askUsername === true ? (
        <div className='lobby-container-parent'>
          <NavigationBar />
          <Typography variant="h4" component="h1" className="lobby-title">
            VALK Lobby
          </Typography>
          <div className="lobby-container">
            <div className="lobby-header">
              <div className="set-guest-name">
                <TextField
                  id="outlined-basic"
                  label="Enter Username"
                  variant="outlined"
                  onChange={(event) => setUsername(event.target.value)}
                  className="username-input"
                  InputProps={{
                    style: {
                      borderRadius: 0,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="medium"
                  className="connect-button"
                  onClick={connect}
                  sx={{ borderRadius: 0 }}
                >
                  Connect
                </Button>
              </div>
            </div>
            {localVideoRef && (
              <div className="video-preview">
                <video ref={localVideoRef} autoPlay muted className="local-video"></video>
              </div>
            )}
          </div>
        </div>

      ) : (
        <div className="meetingVideoContainer">
          {showModal && (
            <div className="chatRoom">
              <div className="chatContainer">
                <h1 style={{
                  color: "black",
                  marginTop: "2rem",
                  textAlign: "center",
                  marginBottom: "2rem"
                }}>Chats</h1>
                <div className="messageBox">
                  <List>
                    {messages.length > 0 ? (
                      messages.map((msg, index) =>
                        msg.data != "" && (
                          msg.senderSocketId !== socketIdRef.current ? (
                            <div key={index} className="userChat">
                              <ListItem>
                                <ListItemText
                                  primary={msg.sender}
                                  secondary={msg.data}
                                />
                              </ListItem>

                            </div>
                          ) : (
                            <div key={index} className="myChat">
                              <ListItem>
                                <ListItemText
                                  secondary={msg.data}
                                />
                              </ListItem>
                            </div>
                          )
                        )
                      )
                    ) : (
                      <h2 style={{
                        marginTop: "15rem",
                        textAlign: "center"
                      }}>No messages yet!</h2>
                    )}
                  </List>
                </div>
              </div>

              <div className="chatArea">
                <TextField
                  margin="normal"
                  required
                  className='enterMsgField'
                  label="Enter your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" className='msgBtn' onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          )}

          <div className="videoGrid">
            <video className="localUserVideo" ref={localVideoRef} autoPlay muted></video>
            <div className={`${allVideos.length == 2 && window.innerWidth <= 560 ? "twoUserStyle" : "userVideos"}`} >
              {allVideos.map((video) => (
                <div
                  className="userVideoFrame"
                  key={video.socketId}
                  style={{
                    maxWidth: videoSize.maxWidth,
                  }}
                >
                  <video
                    data-socket={video.socketId}
                    ref={(ref) => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                  ></video>
                </div>
              ))}
            </div>

          </div>

          <div className="buttonContainer">
            <IconButton onClick={() => setVideo(!video)} style={{ color: "white" }}>
              {video ? <VideoOnIcon /> : <VideoOffIcon />}
            </IconButton>
            <IconButton onClick={endCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={() => setAudio(!audio)} style={{ color: "white" }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable && (
              <IconButton onClick={() => setScreen(!screen)} style={{ color: "white" }}>
                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
            )}
            {rearCameraAvailable && (
              <IconButton onClick={() => setFront(!front)} style={{ color: "white" }}>
                <FlipCameraAndroidIcon />
              </IconButton>
            )}
            <Badge style={{ overflow: "visible" }} badgeContent={unseenMessages} max={999} color="primary">
              <IconButton onClick={() => setShowModal(!showModal)} style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>
        </div>

      )
      }
    </div >
  )
}



export default VideoCall