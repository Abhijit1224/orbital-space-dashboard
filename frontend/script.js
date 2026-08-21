import * as satellite from "https://esm.run/satellite.js";

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let issMarker = null;
let issSatrec = null;
let followISS = false;
let issGroundTrack = L.polyline([], {
    color: "#000000",
    weight: 2,
    opacity: 0.7,
    dashArray: "6, 8"
}).addTo(map);

let selectedGroundTrack = L.polyline([], {
    color: "#2c2b2b",
    weight: 2,
    opacity: 0.6,
    dashArray: "6, 8"
}).addTo(map);
let chartLabels = [];
let altitudeData = [];
let velocityData = [];

let chartSatelliteName = "International Space Station";

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
    issGroundTrack.addLatLng([latitude, longitude]);

if (issGroundTrack.getLatLngs().length > 120) {
    issGroundTrack.getLatLngs().shift();
    issGroundTrack.redraw();
}
let orbitClass = "";

if (altitude < 2000) {
    orbitClass = "LEO";
} else if (altitude < 35786) {
    orbitClass = "MEO";
} else {
    orbitClass = "GEO / HIGH ORBIT";
}
document.getElementById("orbitClass").textContent =
    orbitClass;
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
            .bindPopup(`

        <strong>🛰️ INTERNATIONAL SPACE STATION</strong><br>

        <span style="color:#55e6a5;">● LIVE</span>

    `);
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


followButton.addEventListener("click", async () => {

    followISS = !followISS;

    if (!followISS) {
        followButton.textContent = "🛰️ FOLLOW ISS";
        return;
    }

    followButton.textContent = "🛰️ LOCATING ISS...";

    try {

        if (!issSatrec) {
            const url =
                "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON";

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("ISS data unavailable");
            }

            const data = await response.json();

            issSatrec = satellite.json2satrec(data[0]);
        }

        updateISSPosition();

        if (issMarker) {
            map.setView(issMarker.getLatLng(), 4);
            issMarker.openPopup();
            followButton.textContent = "🛰️ FOLLOWING ISS";
        }

    } catch (error) {

        console.error("ISS follow error:", error);

        followISS = false;
        followButton.textContent = "🛰️ FOLLOW ISS";

    }
});
const searchInput = document.getElementById("satelliteSearch");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

let selectedSatrec = null;
let selectedMarker = null;
let selectedSatelliteName = null;
let followSelectedSatellite = false;
async function trackSatellite(noradId, satelliteName) {
    try {
        const url =
            `https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=JSON`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not load satellite data.");
        }

        const data = await response.json();

        if (!data.length) {
            throw new Error("Satellite data not found.");
        }

        selectedSatrec = satellite.json2satrec(data[0]);
        document.getElementById("trackingStatus").textContent =
    "🟡 ACQUIRING";
        selectedSatelliteName = satelliteName;
        selectedGroundTrack.setLatLngs([]);
document.getElementById("selectedSatelliteDisplay").textContent =
    satelliteName;

document.getElementById("selectedNoradDisplay").textContent =
    `NORAD ${noradId}`;
        updateSelectedSatellite();

        searchResults.innerHTML = `
            <p>🛰️ Tracking <strong>${satelliteName}</strong></p>
        `;

    } catch (error) {
        console.error("Satellite tracking error:", error);

        searchResults.innerHTML =
            "<p>Unable to load satellite telemetry.</p>";
    }
}
function updateSelectedSatellite() {
    if (!selectedSatrec) return;

    const now = new Date();

    const positionAndVelocity =
        satellite.propagate(selectedSatrec, now);

    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    if (!positionEci || !velocityEci) return;

    const gmst = satellite.gstime(now);

    const geodetic =
        satellite.eciToGeodetic(positionEci, gmst);

    const latitude =
        satellite.degreesLat(geodetic.latitude);

    const longitude =
        satellite.degreesLong(geodetic.longitude);

    const altitude = geodetic.height;
selectedGroundTrack.addLatLng([latitude, longitude]);

if (selectedGroundTrack.getLatLngs().length > 120) {
    selectedGroundTrack.getLatLngs().shift();
    selectedGroundTrack.redraw();
}
    const velocity = Math.sqrt(
        velocityEci.x ** 2 +
        velocityEci.y ** 2 +
        velocityEci.z ** 2
    );
    const meanMotion = selectedSatrec.no;
const inclination = selectedSatrec.inclo;
const eccentricity = selectedSatrec.ecco;

const earthRadius = 6378.137;
const earthMu = 398600.4418;

const orbitalPeriodMinutes =
    (2 * Math.PI) / meanMotion;

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
document.getElementById("analyticsAltitude").textContent =
    `${altitude.toFixed(1)} km`;

document.getElementById("analyticsVelocity").textContent =
    `${velocity.toFixed(2)} km/s`;

document.getElementById("trackingStatus").textContent =
    `🟢 LIVE TRACKING`;
    if (chartSatelliteName !== selectedSatelliteName) {
    chartSatelliteName = selectedSatelliteName;

    chartLabels = [];
    altitudeData = [];
    velocityData = [];

    orbitalChart.data.labels = chartLabels;
    orbitalChart.data.datasets[0].data = altitudeData;
    orbitalChart.data.datasets[1].data = velocityData;

    orbitalChart.update();
}

chartLabels.push(now.toLocaleTimeString());
altitudeData.push(Number(altitude.toFixed(1)));
velocityData.push(Number(velocity.toFixed(2)));

if (chartLabels.length > 30) {
    chartLabels.shift();
    altitudeData.shift();
    velocityData.shift();
}

orbitalChart.update();
    if (!selectedMarker) {
        selectedMarker = L.marker([
            latitude,
            longitude
        ])
        .addTo(map)
        .bindPopup(
           `

    <strong>🛰️ ${selectedSatelliteName}</strong><br>

    <span style="color:#55e6a5;">● SELECTED SATELLITE</span>

`);
    } else {
        selectedMarker.setLatLng([
            latitude,
            longitude
        ]);
if (followSelectedSatellite) {
    map.setView([latitude, longitude]);
}
        selectedMarker.setPopupContent(`
    <strong>🛰️ ${selectedSatelliteName}</strong><br>
    <span style="color:#55e6a5;">● SELECTED SATELLITE</span>
`);
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
async function searchSatellites() {
    const query = searchInput.value.trim();

    if (!query) {
        searchResults.innerHTML = "<p>Enter a satellite name.</p>";
        return;
    }

    searchResults.innerHTML = "<p>Searching CelesTrak...</p>";

    try {
        const url =
            `https://celestrak.org/NORAD/elements/gp.php?NAME=${encodeURIComponent(query)}&FORMAT=JSON`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Satellite search failed.");
        }

        const results = await response.json();

        searchResults.innerHTML = "";

        if (!results.length) {
            searchResults.innerHTML =
                "<p>No satellites found.</p>";
            return;
        }

        results.slice(0, 20).forEach(satellite => {
    const result = document.createElement("div");

    result.className = "search-result";

    result.innerHTML = `
        <strong>🛰️ ${satellite.OBJECT_NAME}</strong>
        <span>NORAD ID: ${satellite.NORAD_CAT_ID}</span>
    `;

    result.addEventListener("click", () => {
        trackSatellite(satellite.NORAD_CAT_ID, satellite.OBJECT_NAME);
    });

    searchResults.appendChild(result);
});

    } catch (error) {
        console.error("Satellite search error:", error);

        searchResults.innerHTML =
            "<p>Unable to load satellite data.</p>";
    }
}


searchButton.addEventListener("click", searchSatellites);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchSatellites();
    }
});
setInterval(updateSelectedSatellite, 1000);
const followSatelliteButton =
    document.getElementById("followSatelliteButton");

followSatelliteButton.addEventListener("click", () => {

    if (!selectedSatrec || !selectedMarker) {
        return;
    }

    followSelectedSatellite = !followSelectedSatellite;

    followSatelliteButton.textContent =
        followSelectedSatellite
            ? "🛰️ FOLLOWING SATELLITE"
            : "🛰️ FOLLOW SATELLITE";

    if (followSelectedSatellite) {
        map.setView(
            selectedMarker.getLatLng(),
            4
        );
    }
});