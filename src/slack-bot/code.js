'use strict'
let dotenv = require('dotenv').config(),
    zlib = require('zlib'),
    request = require('request-json'),
    slack_client = request.createClient('https://hooks.slack.com/services/')

exports.handler = function(event, context, callback) {
  console.log('raw data: ', event.awslogs.data)
  let payload = new Buffer(event.awslogs.data, 'base64'),
      events = '',
      message = '',
      slack_fields = [],
      who = 'Unknown',
      ignore_users = ['gordon', 'serverless'],
      ignore_events = ['CreateLogStream'],
      slack_notify = false

  zlib.gunzip(payload, (e, result) => {
    if (e) {
        callback(e)
    } else {
        result = JSON.parse(result.toString('utf8'))

        for (let e of result.logEvents) {
          message = JSON.parse(e.message.toString('utf8'))
          who = message.userIdentity.userName || who

          // Don't want to include events that we don't care about:
          if (
            (message.eventName.startsWith('Delete')
            || message.eventName.startsWith('Create')
            || message.eventName.startsWith('Update')
            || message.eventName.startsWith('Put')
            || message.eventName.startsWith('Authorize')
            || message.eventName.startsWith('Modify')
            || message.eventName.startsWith('Allocate')
            || message.eventName.startsWith('Run')
          ) && ignore_events.indexOf(message.eventName) < 0
            && ignore_users.indexOf(who) < 0
          ) {
            slack_notify = true
            slack_fields.push(
              {"title": "Who", "value": who, "short": true},
              {"title": "Event Name", "value": message.eventName, "short": true},
              {"title": "Event Time", "value": message.eventTime, "short": true},
              {"title": "Action Via", "value": message.eventType, "short": true},
              {"title": "AWS Region", "value": message.awsRegion, "short": true},
              {"title": "Source IP", "value": message.sourceIPAddress, "short": true}
            )
          }
        }

        let slack_payload = {
          "attachments": [
            {
              "fallback": "New AWS event",
              "color": "good",
              // "pretext": "New AWS CloudTrail event",
              "author_name": who,
              "author_link": "",
              "author_icon": "",
              "title": "New AWS CloudTrail event",
              "title_link": "https://console.aws.amazon.com/cloudtrail/home?region=us-east-1#/events",
              // "text": events,
              "fields": slack_fields,
              // "image_url": "http://my-website.com/path/to/image.jpg",
              // "thumb_url": "http://example.com/path/to/thumb.png",
              // "footer": "Footer text",
              // "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            }
          ]
        }

        if (slack_notify) {
          slack_client.post(process.env.SLACK_TOKEN, slack_payload, function(error, res, body) {
            console.log(error)
            callback(error)
          })
        }

        callback(null, `Successfully processed ${result.logEvents.length} log events.\n\n Decoded payload: ${JSON.stringify(result)}`)
    }
  })
}
