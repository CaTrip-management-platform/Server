const Redis = require("ioredis");

//redis-cli -u redis://default:dyffkz9r5rUMJidLD6H6t9pI6SnXpSob@redis-19670.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com:19670
//[protocol]://[username]:[password]@[host/url]:[port]
const redis = new Redis({
    port: 19670,
    host: "redis-19670.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com", 
    username: "default",
    password: "dyffkz9r5rUMJidLD6H6t9pI6SnXpSob",
    db: 0,
  });

  module.exports = redis