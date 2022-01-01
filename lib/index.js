var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "kalmanjs", "present"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.syncTime = exports.addTimeOffset = exports.setTimeOffset = exports.getTime = void 0;
    const kalmanjs_1 = __importDefault(require("kalmanjs"));
    const present_1 = __importDefault(require("present"));
    let LocalTimeOff = new Date().getTime() - (0, present_1.default)();
    let TimeOffset = 0;
    function getTime() {
        return (0, present_1.default)() + LocalTimeOff + TimeOffset;
    }
    exports.getTime = getTime;
    console.log((0, present_1.default)());
    console.log(LocalTimeOff);
    function setTimeOffset(offset) {
        TimeOffset = offset;
    }
    exports.setTimeOffset = setTimeOffset;
    function addTimeOffset(offset) {
        TimeOffset += offset;
    }
    exports.addTimeOffset = addTimeOffset;
    async function getServerOffset(endpoint) {
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
    async function syncTime(
    // Note: No SLA guarantees are made for this endpoint.
    // Don't use it for production.
    // It's only for testing.
    // 
    // time.vlue.dev is synchronized with the NTP server (time.google.com) (leap-smeared time).
    //
    // Run your own server and point this endpoint to it.
    // Server Source Code is available at: https://github.com/lemon-mint/real-time (Written in Go)
    // Or just implement your own server and embed it in your app.
    endpoint = "https://time.vlue.dev/time", samples = 5) {
        await getServerOffset(endpoint); // warm the connection
        let offset = 0;
        const TIME_SYNC_MEASURE_COUNT = samples;
        const kf = new kalmanjs_1.default();
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
    exports.syncTime = syncTime;
    async function main() {
        console.log(await syncTime());
        console.log(new Date().getTime() - getTime());
    }
    main().then();
});
//# sourceMappingURL=index.js.map