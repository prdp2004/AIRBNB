(() => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    const mapToken = mapContainer.dataset.mapToken || "";
    if (!mapToken) {
        mapContainer.textContent = "Map unavailable: set MAP_TOKEN in .env and restart the server.";
        console.error("Mapbox token is missing.");
        return;
    }

    if (!window.mapboxgl) {
        mapContainer.textContent = "Map unavailable: Mapbox GL JS did not load.";
        console.error("Mapbox GL JS did not load.");
        return;
    }

    const longitude = Number(mapContainer.dataset.mapLng);
    const latitude = Number(mapContainer.dataset.mapLat);
    const hasListingCoordinates = mapContainer.dataset.mapLng !== "" &&
        mapContainer.dataset.mapLat !== "" &&
        Number.isFinite(longitude) && Number.isFinite(latitude);
    const center = hasListingCoordinates ? [longitude, latitude] : [77.209, 28.6139];

    window.mapboxgl.accessToken = mapToken;
    const map = new window.mapboxgl.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: 8,
    });

    if (hasListingCoordinates) {
        const marker = new window.mapboxgl.Marker({ color: "red" }).setLngLat(center);
        const title = mapContainer.dataset.listingTitle;
        if (title) {
            marker.setPopup(new window.mapboxgl.Popup({ offset: 25 }).setText(title));
        }
        marker.addTo(map);
    }
})();
