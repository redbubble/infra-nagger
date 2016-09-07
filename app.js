// ENV
var buildkiteToken = process.env.BUILDKITE_TOKEN;
var githubToken = process.env.GITHUB_TOKEN;

// Github Setup
var github = require("octonode");
var ghClient = github.client(githubToken);
var ghRepo = ghClient.repo("redbubble/redbubble");

var updatePR = function(sha, state) {
  console.log("Update PR:" + sha + " -> " + state);

  ghRepo.status(sha, {
    "state": state,
    "target_url": "https://buildkite.com/redbubble/infrastructure-spec/builds?branch=master",
    "context": "infra-specs",
    "description": "Checking Infrastructure Specs"
  }, function() {});
}

// Buildkite Setup
var buildnode = require("buildnode")({ accessToken: buildkiteToken });

var checkBuildStatus = function(callback) {
  buildnode.getOrganization("redbubble", function (err, org) {
    if (err || !org) {
      console.log("Error fetching buildkite organisation");
      return;
    }

    org.getPipeline("infrastructure-spec", function(err, pipeline) {
      if (err || !pipeline) {
        console.log("Error fetching buildkite pipeline");
        return;
      }

      pipeline.listBuilds(function(err, builds) {
        if (err || !builds) {
          console.log("Error fetching buildkite builds");
          return;
        }

        callback(builds[0].state);
      });
    });
  });
}

// Express Setup
var https      = require("https");
var express    = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());

app.post("/pr-updated", function(req, res) {
  console.log("Received POST on /pr-updated", req.headers, req.body);

  // Verify Type
  if (req.headers["x-github-event"] != "pull_request") {
    console.log("No Github Signature");
    return res.status(401).send("Signature Missing");
  }

  if (req.body.action === "opened" ||
      req.body.action === "synchronize" ||
      req.body.action === "edited") {

    var pr = req.body.pull_request;

    updatePR(pr.head.sha, "pending");
    checkBuildStatus(function(state) {
      // See https://buildkite.com/docs/api/builds#list-all-builds
      // and https://developer.github.com/v3/activity/events/types/#statusevent
      if (state === "passed") {
        prStatus = "success"
      } else if (state === "running") {
        prStatus = "pending"
      } else {
        prStatus = "failure"
      }
      updatePR(pr.head.sha, prStatus);
    });
  }

  res.send("AOK");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Express listening on port", this.address().port);
});
