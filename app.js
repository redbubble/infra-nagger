// ENV
var buildkiteToken = process.env.BUILDKITE_TOKEN;
var slackBotToken = process.env.SLACK_BOT_TOKEN;

// Slack Setup
var slackChannel = "#deploy-prod";
var Botkit = require("botkit");
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: slackBotToken
});

bot.startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error("Could not connect to Slack: " + err);
  }

  console.log("Slack Bot running");
});

// Express Setup
var https      = require("https");
var express    = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());

// App
app.post("/build-finished", function(req, res) {
  console.log("Received POST on /build-finished", req.headers, req.body);

  // Verify token
  if (req.headers["x-buildkite-token"] != buildkiteToken) {
    console.log("Invalid buildkite token");
    return res.status(401).send("Invalid token");
  }

  var buildkiteEvent = req.headers["x-buildkite-event"];
  if (buildkiteEvent == "build.finished") {
    var build = req.body.build;
    var pipeline = req.body.pipeline;

    console.log("Build finished: " + pipeline.slug + " -> " + build.state);

    if (build.state == "passed") {
      bot.say({ text: "cancel deploy-prod", channel: slackChannel });
    } else {
      bot.say({ text: "steal deploy-prod", channel: slackChannel });
    }
  }

  res.send("AOK");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Express listening on port", this.address().port);
});

