// ENV
var buildkite_token = process.env.BUILDKITE_TOKEN;

var https      = require("https");
var express    = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());

app.post("/build-finished", function(req, res) {
  console.log("Received POST on /build-finished", req.headers, req.body);

  // Verify token
  if (req.headers["x-buildkite-token"] != buildkite_token) {
    console.log("Invalid buildkite token");
    return res.status(401).send("Invalid token");
  }

  var buildkiteEvent = req.headers["x-buildkite-event"];
  if (buildkiteEvent == "build.finished") {
    var build = req.body.build;
    var pipeline = req.body.pipeline;

    console.log("Build finished: " + pipeline.slug + " -> " + build.state);
  }

  res.send("AOK");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Express listening on port", this.address().port);
});
