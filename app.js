// ENV
var buildkiteToken = process.env.BUILDKITE_TOKEN;
var slackBotToken = process.env.SLACK_BOT_TOKEN;

// Slack Setup
var slackChannelID = null;
var postToChannel = function(text) {
  console.log("Slack Bot sending: " + text);
  bot.say({ text: text, channel: slackChannelID });
}

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

  // Get #deploy-prod channel id
  bot.api.channels.list({}, function (err, response) {
    if (response.hasOwnProperty("channels") && response.ok) {
      var total = response.channels.length;
      for (var i = 0; i < total; i++) {
        var channel = response.channels[i];

        if (channel.name === "deploy-prod") {
          slackChannelID = channel.id;
          console.log("Slack Channel ID: " + slackChannelID);

          break;
        }
      }
    }
  });

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

    if (build.state === "passed") {
      postToChannel("cancel deploy-prod");
    } else {
      postToChannel("steal deploy-prod");
      postToChannel("infrastructure-specs are broken! Please fix before deploying to prod... :angry:");
    }
  }

  res.send("AOK");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Express listening on port", this.address().port);
});

