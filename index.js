require("dotenv").config();

var port = process.env.PORT || 3000;

var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const RTCMultiConnectionServer = require("rtcmulticonnection-server");
app.use(express.static("public"));

io.on("connection", function (socket) {
  RTCMultiConnectionServer.addSocket(socket);
  const params = socket.handshake.query;

  if (!params.socketCustomEvent) {
    params.socketCustomEvent = "custom-message";
  }

  socket.on(params.socketCustomEvent, function (message) {
    socket.broadcast.emit(params.socketCustomEvent, message);
  });

  socket.on("token", function () {
    console.log("Received token request");
    twilio.tokens.create(function (err, response) {
      if (err) {
        console.log(err);
      } else {
        // Return the token to the browser.
        console.log("Token generated. Returning it to the client");
        socket.emit("token", response);
      }
    });
  });
});
http.listen(port, () => console.log(`listening on *: ${port}`));
