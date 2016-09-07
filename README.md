Infra Nagger
============

A Github webhook target to make our [infrastructure specs][infra-specs] status visible in our pull requests.

We constantly monitor our infrasturcture health through automated testing. If at any time the so-called _infra specs_ are broken, we want all business to stop deploying before they are fixed. The Infra Nagger allows to happen the status of our _infra specs_ in all our pull requests (PR) so that a failure in the _infra specs_ build prevents any new feature to be deployed to the corresponding repositories.

![](doc/illustration.png)

  [infra-specs]: https://buildkite.com/redbubble/infrastructure-spec/builds?branch=master

Installation
------------

Infra Nagger is meant to be a [webhook][webhooks] target for Github. You can create a new webhook for your repositories using the follwing settings:

- **Payload URL**: _https://rb-infra-nagger.herokuapp.com/pr-updated_
- **Content Type**: _application/json_
- **Which events would you like to trigger this webhook?**: _Pull Request_, _Pull request review comment_

Make sure your webhooks is **active**!

Usage
-----

With these settings, the infrastructure specs status will be checked automatically everytime your **create a PR**, and everytime you **edit the first comment** of a PR.

In other terms, if you pushed to your PR when the _infra specs_ were broken, editing the first comment of the PR once they are fixed will give you the green light to merge and deploy your changes. That way, we all the benefits of highly visible failures without getting your workflow slown down when they're being taken care of. Amazing, right?

  [webhooks]: https://developer.github.com/webhooks

Development
-----------

To be operational, Infra Nagger must be deployed to a server that can be acceded by the Github webhooks. We currently use Heroku for that.

Credits
-------

[![](doc/redbubble.png)][redbubble]

Infra Nagger is maintained and funded by [Redbubble][redbubble].

  [redbubble]: https://www.redbubble.com

License
-------

    Infra Nagger
    Copyright (C) 2016 Redbubble

    All right reserved.
