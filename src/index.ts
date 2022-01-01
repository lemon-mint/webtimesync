import KalmanFilter from "kalmanjs";
import present from "present";

let LocalTimeOff = new Date().getTime() - present();
let TimeOffset = 0;

export function getTime() {
  return present() + LocalTimeOff + TimeOffset;
}
console.log(present());
console.log(LocalTimeOff);

export function setTimeOffset(offset: number) {
  TimeOffset = offset;
}

export function addTimeOffset(offset: number) {
  TimeOffset += offset;
}

async function getServerOffset(endpoint: string) {
  const t0 = getTime();
  const response = await fetch(endpoint);
  const t3 = getTime();
  const json = await response.json();
  const t1 = json.t1;
  const t2 = json.t2;
  //
  // Response Should be a JSON object with two fields:
  // t1: the server time when the request was received (float)
  // t2: the server time when the response was sent (float)
  // UNITS: milliseconds since the epoch
  // Example response: { t1: 1641046048901.079, t2: 1641046048901.079 }
  //

  const offset = (t1 - t0 + t2 - t3) / 2;
  // Calculate the offset between the server and the client
  return offset;
}

export async function syncTime(
  // Note: No SLA guarantees are made for this endpoint.
  // Don't use it for production.
  // It's only for testing.
  // 
  // time.vlue.dev is synchronized with the NTP server (time.google.com) (leap-smeared time).
  //
  // Run your own server and point this endpoint to it.
  // Server Source Code is available at: https://github.com/lemon-mint/real-time (Written in Go)
  // Or just implement your own server and embed it in your app.
  endpoint: string = "https://time.vlue.dev/time",
  samples: number = 5
) {
  await getServerOffset(endpoint); // warm the connection

  let offset = 0;

  const TIME_SYNC_MEASURE_COUNT = samples;
  const kf = new KalmanFilter();
  for (let i = 0; i < TIME_SYNC_MEASURE_COUNT; i++) {
    //console.log("Measurement: " + i);
    //console.log("Requesting time offset...");
    const off = await getServerOffset(endpoint);
    const kfOff = kf.filter(off);
    //console.log("Server offset: " + off);
    //console.log("Kalman filter offset: " + kfOff);
    offset += kfOff;
  }

  offset /= TIME_SYNC_MEASURE_COUNT;
  addTimeOffset(offset);

  return offset;
}

async function main() {
  console.log(await syncTime());

  console.log(new Date().getTime() - getTime());
}

main().then();
