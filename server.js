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

const PORT = +process.argv[2] || 3000;
const app = express();
const compiler = webpack(webpackConfig);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "ProjectFiles")));
app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.use(
       webpackDevMiddleware(compiler, {
              publicPath: webpackConfig.output.publicPath,
              stats: { colors: true },
       })
);

mongoose.connect(process.env.MONGODB_URI)
.then(data => {
       console.log("Database connected");
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

app.listen(PORT, (err) => {
       if (err) console.error(err);
       console.log("Server running on PORT:", PORT);
});