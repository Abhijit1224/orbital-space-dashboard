import * as satellite from "https://esm.run/satellite.js";

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let issMarker = null;
let issSatrec = null;
let followISS = false;

async function loadISSData() {
    const url =
        "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not fetch ISS orbital data.");
    }

    const data = await response.json();

    issSatrec = satellite.json2satrec(data[0]);

    updateISSPosition();
}

function updateISSPosition() {
    if (!issSatrec) return;

    const now = new Date();

    const positionAndVelocity =
        satellite.propagate(issSatrec, now);

    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    const gmst = satellite.gstime(now);

    const geodetic =
        satellite.eciToGeodetic(positionEci, gmst);

    const latitude = satellite.degreesLat(geodetic.latitude);
    const longitude = satellite.degreesLong(geodetic.longitude);

    const altitude = geodetic.height;

    const velocity = Math.sqrt(
        velocityEci.x ** 2 +
        velocityEci.y ** 2 +
        velocityEci.z ** 2
    );
document.getElementById("analyticsAltitude").textContent =
    `${altitude.toFixed(1)} km`;

document.getElementById("analyticsVelocity").textContent =
    `${velocity.toFixed(2)} km/s`;
    if (!issMarker) {
        issMarker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup("🛰️ International Space Station");
    } else {
        issMarker.setLatLng([latitude, longitude]);
    }
if (followISS) {
    map.setView([latitude, longitude]);
}
    document.getElementById("latitude").textContent =
        `${latitude.toFixed(2)}°`;

    document.getElementById("longitude").textContent =
        `${longitude.toFixed(2)}°`;

    document.getElementById("altitude").textContent =
        `${altitude.toFixed(1)} km`;

    document.getElementById("velocity").textContent =
        `${velocity.toFixed(2)} km/s`;

    document.getElementById("updated").textContent =
        now.toLocaleTimeString();
}

loadISSData().catch(error => {
    console.error("ISS tracking error:", error);
});

setInterval(updateISSPosition, 1000);
const followButton = document.getElementById("followButton");

followButton.addEventListener("click", () => {
    followISS = !followISS;

    followButton.textContent = followISS
        ? "🛰️ FOLLOWING ISS"
        : "🛰️ FOLLOW ISS";

    if (followISS && issMarker) {
        map.setView(issMarker.getLatLng());
    }
});