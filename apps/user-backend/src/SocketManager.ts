import { createClient, RedisClientType } from "redis";
import WebSocket from "ws";

interface SocketObject {
    userId: string;
    socket: WebSocket;
}

export class SocketManager {
    private sockets: SocketObject[]
    private static instance: SocketManager;
    private redisClient: RedisClientType
    private redisPublisher: RedisClientType;

    private constructor() {
        this.sockets = [];
        this.redisClient = createClient({
            url: 'redis://localhost:6379'
        })
        this.redisPublisher = createClient({
            url: 'redis://localhost:6379'
        })
        this.redisClient.connect()
        this.redisPublisher.connect()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new SocketManager();
        }
        return this.instance;
    }

    addSocket(socket: WebSocket, userId: string) {
        for(let i = 0; i < this.sockets.length; i++) {
            if(this.sockets[i]?.userId === userId) {
                this.redisClient.unsubscribe(userId.toString())
                this.sockets[i]?.socket.close()
                this.sockets.splice(i, 1)
            }
        }
        console.log("le sockets")
        for(let i = 0; i < this.sockets.length; i++) {
            console.log(this.sockets[i])
        }
        this.sockets.push({ userId, socket });
        console.log(userId, this.sockets.length)
        this.redisClient.subscribe(userId, (message) => {
            console.log(message)
            const socketObject = this.sockets.find((so) => so.userId === userId);
            if (socketObject) {
                console.log("found socket")
                socketObject.socket.send(message);
            }
        })
        socket.on('close', () => {
            this.removeSocket(socket);
        });
    }

    broadcastSingleUser(userId: string, message: string) {
        console.log("braodcast", userId)
        this.redisPublisher.publish(userId, message);
    }
    
    broadcast(fromUserId: string, toUserId: string, message: string) {
        this.redisPublisher.publish(fromUserId, message);
        this.redisPublisher.publish(toUserId, message);
    }

    removeSocket(socket: WebSocket) {
        let socketObject: SocketObject | undefined
        for(let i = 0; i < this.sockets.length; i++) {
            if(this.sockets[i]?.socket === socket) {
                socketObject = this.sockets[i]
                break
            }
        }
        if(!socketObject) return
        this.redisClient.unsubscribe(socketObject.userId.toString())
    }
}