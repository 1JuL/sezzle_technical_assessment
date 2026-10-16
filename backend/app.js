var createError = require("http-errors");
var express = require("express");
var path = require("path");
var fs = require("fs");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// CORS middleware
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}

app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Serve the built frontend when present
var frontendDist = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Routes
app.use("/api", apiRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  var status =
    err.status && err.status < 500
      ? err.status
      : err.statusCode && err.statusCode < 500
        ? err.statusCode
        : 500;

  // Return JSON for API routes, JSON parsing errors, or when JSON is requested
  var isApi =
    req.path.startsWith("/api") ||
    (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) ||
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    err instanceof SyntaxError;

  if (isApi) {
    var errorMessage =
      status === 500 ? "Internal server error" : err.message || "Invalid request body";
    return res.status(status).json({ error: errorMessage });
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(status);
  res.render("error");
});

module.exports = app;
