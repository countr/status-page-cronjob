// discord.js
var Status;
(function (Status) {
    Status[Status["Ready"] = 0] = "Ready";
    Status[Status["Connecting"] = 1] = "Connecting";
    Status[Status["Reconnecting"] = 2] = "Reconnecting";
    Status[Status["Idle"] = 3] = "Idle";
    Status[Status["Nearly"] = 4] = "Nearly";
    Status[Status["Disconnected"] = 5] = "Disconnected";
    Status[Status["WaitingForGuilds"] = 6] = "WaitingForGuilds";
    Status[Status["Identifying"] = 7] = "Identifying";
    Status[Status["Resuming"] = 8] = "Resuming";
})(Status || (Status = {}));
export default Status;
