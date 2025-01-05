import { Server } from "socket.io"

const connections = {}
const timeOnline = {}
const messages = {}

export const connectToSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            allowedHeaders: ["*"],
            methods: ["get", "post"],
            credentials: true
        }
    })

    io.on("connection", (socket) => {

        console.log("connection made on socketIo server")
        let userName=socket.handshake?.query?.userName

        socket.on("join-call", ({path}) => {
            console.log("reached join call")
            if (connections[path] === undefined) {
                connections[path] = []
            }

            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date()
            // console.log(connections[path]+"\n",path)
            connections[path].forEach(socketId => {
                // console.log(socket.id)
                io.to(socketId).emit("user-joined", socket.id, connections[path],userName)
            });

            if (messages[path] !== undefined) {
                messages[path].forEach(msgObj => {
                    io.to(socket.id).emit("chat-message", msgObj["data"], msgObj["sender"], msgObj["socket - id - sender"])
                })
            }
        })


        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message)
        })


        socket.on("chat-message", (data, sender) => {

            try {
                console.log("message recieved from user")
                    const [matchingRoom, found] = Object.entries(connections)
                        .reduce(([room, isFound], [roomKey, roomMembers]) => {
                            if (!isFound && roomMembers.includes(socket.id)) {
                                return [roomKey, true]
                            }
                        }, ['', false])

                    if (found === true) {
                        if (messages[matchingRoom] === undefined) {
                            messages[matchingRoom] = []
                        }
                        messages[matchingRoom].push({
                            data,
                            sender,
                            "socket-id-sender": socket.id
                        })

                        connections[matchingRoom].forEach(roomMembers => {
                            io.to(roomMembers).emit("chat-message", data, sender, socket.id)
                        });

                }
            } catch (error) {
                console.log(error)
            }


        })

        socket.on("disconnect", () => {
            console.log("disconnect ran")

            let diffTime = Math.abs(timeOnline[socket.id] - new Date())

            let key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id,userName)
                        }

                        let index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }

            }


        })
    })
    return io
}