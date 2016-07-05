# [cloudtrail-bot](https://github.com/knncreative/cloudtrail-bot)

> Slack bot to monitor AWS CloudTrail

### Overview
This Slack bot uses Gordon to deploy the Lambda app

### Getting Started

Create the `src/slack-bot/.env` file with your Slack credential
```sh
SLACK_TOKEN=xxx/yyy/zzz
```

Currently only reporting these event names starting with:

    Delete, Create, Update, Put, Authorize, Modify, Allocate, Run

### Deploy
```sh
aws configure # configure your AWS creds
gordon build
gordon apply
```

### Test
```sh
npm test              
npm run test:watch    # watch for changes
npm run test:cover    # coverage
```

### License

MIT
