# WebTimeSync

A lightweight http-based time synchronization library.

# Server Side

Server returns a simple json response with the timing information.

Server SHOULD process requests in constant time

Response SHOULD be a JSON object with the following keys:

t1: the server time when the request was received (float)
t2: the server time when the response was sent (float)

The unit MUST be milliseconds

Example response: `{"t1":1641083722668.4788,"t2":1641083722668.484}`

Reference implementation: [https://github.com/lemon-mint/real-time](https://github.com/lemon-mint/real-time)

## Demo Server

You can use this Demo Server to test your client.

endpoint: [https://time.vlue.dev/time](https://time.vlue.dev/time)

Note: This server is not meant to be used in production.

Disclaimer: The Software is provided "AS IS" without any warranty of any kind, express, implied or otherwise.

time.vlue.dev is synchronized with the [NTP server](https://developers.google.com/time/) (leap-smeared time).

# Client Side

``` javascript
import {
    getTime,
    syncTime
} from 'webtimesync';

async function main() {
    // synchronize the time
    await syncTime();

    // get the time
    const time = getTime();
    console.log(time);

    // calculate the time difference
    console.log(time - new Date().getTime());
}

main();
```
