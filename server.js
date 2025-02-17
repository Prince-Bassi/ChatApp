import "dotenv/config";
import path from "path";
import express from "express";
import webpack from "webpack";
import webpackConfig from "./webpack.config.js";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import routes from "./routes.js";
import {fileURLToPath} from "url";
import mongoose from "mongoose";
import cors from "cors";
import {Server} from "socket.io";
import http from "http";
import User from "./Models/User.js";

const PORT = +process.argv[2] || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
       cors: {
              origin: [`http://localhost:${PORT}`, `http://${process.env.MY_IP1}:${PORT}`],
              methods: ["GET", "POST"]
       }
});
const compiler = webpack(webpackConfig);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "ProjectFiles")));
app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.use(cors({
       origin: [`http://localhost:${PORT}`, `http://${process.env.MY_IP1}:${PORT}`],
       credentials: true
}));

app.use(
       webpackDevMiddleware(compiler, {
              publicPath: webpackConfig.output.publicPath,
              stats: { colors: true },
       })
);

function listenForConnections() {
       io.on("connection", async (userSocket) => {
              let socketUser = await User.findOne({socketId: userSocket.id});

              if (!socketUser) {
                     socketUser = await User.findOneAndUpdate(
                            {email: userSocket.handshake.auth.email},
                            {socketId: userSocket.id},
                            {new: true}
                     );
              }

              if (socketUser) {
                     console.log("Client connected. Id: ", userSocket.id);
                     if (socketUser.pendingMessages.length) {
                            socketUser.pendingMessages.forEach(({sender, text}) => {
                                   userSocket.emit("fromServerMessage", {sender, text});
                            });

                            socketUser.pendingMessages = [];
                            await socketUser.save();
                     }
              }

              userSocket.on("toServerMessage", async ({sender, targetEmail, text}) => {
                     console.log(`Message from ${sender}`, text);
                     const targetUser = await User.findOne({email: targetEmail});

                     if (!targetUser) return console.log("No user found");

                     if (!targetUser.socketId) {
                            userSocket.emit("fromServerMessage", {sender, text});
                            
                            targetUser.pendingMessages.push({sender, text});
                            await targetUser.save();
                            return;
                     }

                     io.to(targetUser.socketId).emit("fromServerMessage", {sender, text});
                     userSocket.emit("fromServerMessage", {sender, text});
              });

              userSocket.on("disconnect", async () => {
                     console.log("Client disconnected. Id:", userSocket.id);

                     if (socketUser) {
                            socketUser.socketId = null;
                            await socketUser.save();
                     }
              });
       });
}

mongoose.connect(process.env.MONGODB_URI)
.then(data => {
       console.log("Database connected");
       listenForConnections();
})
.catch(err => {
       console.error(err);
       process.exit(1);
});

app.use(webpackHotMiddleware(compiler));
app.use("/api", routes);

app.get("*", (req, res) => {
       res.sendFile(path.join(__dirname, "ProjectFiles", "index.html"));
});

app.use((err, req, res, next) => {
       console.error(err);
       res.status(err.statusCode || 500).send(err.message || "Something unexpected happened");
});

server.listen(PORT, "0.0.0.0", (err) => {
       if (err) console.error(err);
       console.log("Server running on PORT:", PORT);
});