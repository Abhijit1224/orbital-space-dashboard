import * as satellite from "https://esm.run/satellite.js";

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let issMarker = null;
let issSatrec = null;
let followISS = false;
const chartLabels = [];
const altitudeData = [];
const velocityData = [];

const orbitalChart = new Chart(
    document.getElementById("orbitalChart"),
    {
        type: "line",

        data: {
            labels: chartLabels,

            datasets: [
                {
                    label: "Altitude (km)",
                    data: altitudeData,
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: "yAltitude"
                },
                {
                    label: "Velocity (km/s)",
                    data: velocityData,
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: "yVelocity"
                }
            ]
        },

        options: {
            responsive: true,
            animation: false,

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time"
                    }
                },

                yAltitude: {
                    type: "linear",
                    position: "left",

                    title: {
                        display: true,
                        text: "Altitude (km)"
                    }
                },

                yVelocity: {
                    type: "linear",
                    position: "right",

                    title: {
                        display: true,
                        text: "Velocity (km/s)"
                    },

                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    }
);
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
const meanMotion = issSatrec.no;
const inclination = issSatrec.inclo;
const eccentricity = issSatrec.ecco;
const earthRadius = 6378.137;
const earthMu = 398600.4418;

const meanMotionRadPerMin = meanMotion;

const orbitalPeriodMinutes =
    (2 * Math.PI) / meanMotionRadPerMin;

const semiMajorAxis =
    Math.cbrt(
        earthMu /
        Math.pow(meanMotion / 60, 2)
    );

const perigeeAltitude =
    semiMajorAxis * (1 - eccentricity) - earthRadius;

const apogeeAltitude =
    semiMajorAxis * (1 + eccentricity) - earthRadius;

const inclinationDegrees =
    inclination * (180 / Math.PI);
    document.getElementById("perigee").textContent =
    `${perigeeAltitude.toFixed(1)} km`;

document.getElementById("apogee").textContent =
    `${apogeeAltitude.toFixed(1)} km`;

document.getElementById("orbitalPeriod").textContent =
    `${orbitalPeriodMinutes.toFixed(1)} min`;

document.getElementById("inclination").textContent =
    `${inclinationDegrees.toFixed(2)}°`;
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
        chartLabels.push(now.toLocaleTimeString());
altitudeData.push(Number(altitude.toFixed(1)));
velocityData.push(Number(velocity.toFixed(2)));

if (chartLabels.length > 30) {
    chartLabels.shift();
    altitudeData.shift();
    velocityData.shift();
}

orbitalChart.update();
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