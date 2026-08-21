import * as satellite from "https://esm.run/satellite.js";

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

async function trackISS() {
    const url =
        "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not fetch ISS orbital data.");
    }

    const data = await response.json();

    const satrec = satellite.json2satrec(data[0]);

    const now = new Date();

    const positionAndVelocity =
        satellite.propagate(satrec, now);

    const positionEci = positionAndVelocity.position;

    const gmst = satellite.gstime(now);

    const geodetic =
        satellite.eciToGeodetic(positionEci, gmst);

    const latitude =
        satellite.degreesLat(geodetic.latitude);

    const longitude =
        satellite.degreesLong(geodetic.longitude);

    console.log("ISS Latitude:", latitude);
    console.log("ISS Longitude:", longitude);

    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("🛰️ International Space Station")
        .openPopup();
}

trackISS().catch(error => {
    console.error("ISS tracking error:", error);
});