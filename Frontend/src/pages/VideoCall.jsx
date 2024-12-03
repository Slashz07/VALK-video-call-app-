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
import { Badge, IconButton, TextField } from '@mui/material';
import VideoOnIcon from '@mui/icons-material/Videocam';
import VideoOffIcon from '@mui/icons-material/VideocamOff'
import { useNavigate } from 'react-router-dom';
import CheckAuth from '../Utils/CheckAuth';
import NavigationBar from '../Utils/NavigationBar';

const server_url = "http://localhost:5005"

let connections = {}

const peerConfigConnections = {
  "iceServers": [
    {
      "urls": "stun:stun.l.google.com:19302"
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
  const navigate = useNavigate()



  // const handleDevices = async () => {
  //   try {
  //     const inputDevices = await navigator.mediaDevices.enumerateDevices()
  //     const cameraAvail = inputDevices.filter((device) => device.kind === "videoinput")
  //     const audioAvail = inputDevices.filter((device) => device.kind === "audioinput")

  //     if (cameraAvail.length > 0) {
  //       const videoPermit = await navigator.mediaDevices.getUserMedia({ video: true })
  //       setVideoPermission(videoPermit)
  //       setVideoAvailable(true)
  //     } else {
  //       let videoTracks = localVideoRef.current.srcObject.getVideoTracks()
  //       videoTracks.forEach((track) => {
  //         track.stop()
  //       })
  //     }
  //     if (audioAvail) {
  //       const audioPermit = await navigator.mediaDevices.getUserMedia({ audio: true })
  //       setAudioPermission(audioPermit)
  //       setAudioAvailable(true)
  //     } else {
  //       let audioTracks = localVideoRef.current.srcObject.getAudioTracks()
  //       audioTracks.forEach((track) => {
  //         track.stop()
  //       })
  //     }
  //   } catch (error) {

  //   }
  // }

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
    try {
      window.localStream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      console.log(error)
    }

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }

      // connections[id].addStream(window.localStream)
      if (window.localStream) {
        // Add all tracks from the local stream to the peer connection
        window.localStream.getTracks().forEach((track) => {
          connections[id].addTrack(track, window.localStream);
        });
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

      let blackSilence = (...args) => {
        new MediaStream([black(...args), silence()])
      }

      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream

      for (let id in connections) {

        if (id === socketIdRef.current) continue;

        window.localStream.getTracks().forEach((track) => {
          connections[id].addTrack(track, window.localStream)
        })

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
        navigator.mediaDevices.getUserMedia({ video, audio })
          .then(getDeviceStreamsSuccess)
          .then((stream) => { })
          .catch((err) => {
            console.log(err)
          })
      } else {
        const player = localVideoRef.current?.srcObject
        const tracks = player ? player.getTracks() : null//since in case user doesnt give any permission the srcObject doesnt have tracks and srcObject.getTracks() will throw error
        tracks && tracks.forEach((track) => track.stop())
      }
    } catch (error) {
      console.log(error)
    }
  }
  const messageFromServer = (fromId, message) => {
    let signal = JSON.parse(message)
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
              }).catch((err) => console.log(err))
            }).catch((err) => console.log(err))
          }
        }).catch((err) => console.log(err))
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(err => console.log(err))
      }
    }
  }

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

            window.localStream.getTracks().forEach((track) => {
              connections[socketId].addTrack(track, window.localStream);
            });
          } else {
            // blackSilence()
            let blackSilence = (...args) => {
              new MediaStream([black(...args), silence()])
            }

            window.localStream = blackSilence();
            // connections[socketId].addStream(window.localStream)
            if (window.localStream) {
              // Add all tracks from the local stream to the peer connection
              window.localStream.getTracks().forEach((track) => {
                connections[socketId].addTrack(track, window.localStream);
              });
            }

          }


        });


        if (socketIdRef.current === id) {//i.e if the id of the client whose system this frontend code is running upon is the same as the one that currently joined the room which sends the message "user-joined" 
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) {
              continue
            }
            try {
              // connections[id2].addStream(window.localStream)


              // if (window.localStream) {
              //   // Add all tracks from the local stream to the peer connection
              //   window.localStream.getTracks().forEach((track) => {
              //     connections[id2].addTrack(track, window.localStream);
              //   });
              // }

            } catch (error) {

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
  }, [audio, video])

  const getScreenMediaSuccess = (stream) => {
    window.localStream.getTracks().forEach((track) => track.stop())

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }

      window.localStream.getTracks().forEach((track) => {
        console.log("tracks added from screenshare: ", track.id);
        connections[id].addTrack(track, window.localStream)
      })

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

      let blackSilence = (...args) => {
        return new MediaStream([black(...args), silence()])
      }

      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream

      getDeviceStreams()



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
      const streamTracks=window.localStream.getTracks()
      streamTracks.forEach((track)=>track.stop())
      
      const userTracks=localVideoRef.current.srcObject.getTracks()
      userTracks && userTracks.forEach((track) => track.stop())

      socketRef.current.disconnect()
    } catch (error) {
      console.log(error)
    }
    navigate("/home")
  }

  // useEffect(() => {
  //   let cameraPermissionStatus, microphonePermissionStatus;

  //   // Function to initialize permission listeners
  //   const setupPermissionListeners = async () => {
  //     // Check camera permission and set listener
  //     cameraPermissionStatus = await navigator.permissions.query({ name: 'camera' });
  //     if(cameraPermissionStatus.state!==videoAvailable)
  //     setVideoAvailable(cameraPermissionStatus.state);
  //     cameraPermissionStatus.onchange = () => setVideoPermission(cameraPermissionStatus.state);

  //     // Check microphone permission and set listener
  //     microphonePermissionStatus = await navigator.permissions.query({ name: 'microphone' });
  //     setAudioPermission(microphonePermissionStatus.state);
  //     microphonePermissionStatus.onchange = () => setAudioPermission(microphonePermissionStatus.state);
  //   };

  //   setupPermissionListeners();

  //   // Clean up listeners on unmount
  //   return () => {
  //     if (cameraPermissionStatus) cameraPermissionStatus.onchange = null;
  //     if (microphonePermissionStatus) microphonePermissionStatus.onchange = null;
  //   };
  // }, []);

  return (
    <div>
      {askUsername === true ? (
        <div>
          <NavigationBar />
          <h2>Enter into lobby</h2>
          <div className='setGuestName'>
            <TextField id="outlined-basic" label="Outlined" variant="outlined" onChange={(event) => setUsername(event.target.value)} />
            <Button variant="contained" size="medium" sx={{ mt: 3, mb: 2 }} onClick={connect}>
              Connect
            </Button>
          </div>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) :
        <div className='meetingVideoContainer'>
          {showModal ?
            <div className='chatRoom'>
              <div className='chatContainer'>
                <h1>Chats</h1>
                {
                  console.log(messages)
                }
                <div className='messageBox'>

                  {
                    messages.length > 0 ? (
                      messages.map((msg, index) => (
                        msg.senderSocketId !== socketIdRef.current ?
                          <div key={index} className='userChat'>
                            {
                              <TextField
                                disabled
                                margin="normal"
                                className='userMessage'
                                fullWidth
                                id="outlined-basic"
                                label={msg.sender}
                                value={msg.data}
                              />
                            }
                          </div>
                          :
                          <div key={index} className='myChat'>
                            {<TextField
                              disabled
                              margin="normal"
                              className='myMessage'
                              fullWidth
                              id="outlined-basic"
                              label={msg.sender}
                              value={msg.data}
                            />}
                          </div>
                      ))
                    ) : <>
                      <h2>No messages yet!</h2>
                    </>

                  }
                </div>


              </div>
              <div className='chatArea'>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="outlined-basic"
                  label="Enter your message"
                  name="userName"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant='contained' onClick={() => sendMessage()}>
                  Send
                </Button>
              </div>
            </div>
            : <></>}

          <div className='buttonContainer'>
            <IconButton onClick={() => setVideo((currVideo) => !currVideo)} style={{ color: "white" }}>
              {video ? <VideoOnIcon /> : <VideoOffIcon />}
            </IconButton>
            <IconButton onClick={() => endCall()} style={{ color: "red" }}>
              {<CallEndIcon />}
            </IconButton>
            <IconButton onClick={() => setAudio((currAudio) => !currAudio)} style={{ color: "white" }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {
              screenAvailable ?
                <IconButton onClick={() => setScreen((currScreen) => !currScreen)} style={{ color: "white" }}>
                  {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton> : <></>
            }

            <Badge badgeContent={unseenMessages} max={999} color='primary'>
              <IconButton onClick={() => setShowModal((showModal) => !showModal)} style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video className='localUserVideo' ref={localVideoRef} autoPlay muted></video>

          <div className='conference'>
            {allVideos.map((video) => (
              <div className='userVideoFrames' key={video.socketId}>
                {console.log(video)}
                {/* <h1 style={{color:"white"}}>{video.socketId}</h1> */}
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream//ref here works similar to how "this" works in class
                    }
                  }}
                  autoPlay
                >
                </video>
              </div>

            ))}
          </div>



        </div>
      }
    </div>

  )
}



export default VideoCall