document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    var map = L.map('map').setView([51.505, -0.09], 13);

    // Custom dark tile layer
    var darkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    // Add dark tile layer to the map
    darkLayer.addTo(map);

    // Get input elements
    var fromInput = document.getElementById('from');
    var toInput = document.getElementById('to');
    var fromLatInput = document.getElementById('from_lat');
    var fromLngInput = document.getElementById('from_lng');
    var toLatInput = document.getElementById('to_lat');
    var toLngInput = document.getElementById('to_lng');

    // Initialize markers
    var fromMarker;
    var toMarker;
    var routeLine;

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            
            // Center map on user's location
            map.setView([lat, lng], 14);
            
            // Set initial from marker at user's location
            setFromMarker([lat, lng]);
            
            // Reverse geocode to get address
            reverseGeocode(lat, lng, function(address) {
                fromInput.value = address;
                fromLatInput.value = lat;
                fromLngInput.value = lng;
            });
        });
    }

    // Map click event
    map.on('click', function(e) {
        var latitude = e.latlng.lat;
        var longitude = e.latlng.lng;

        // If from is empty, set from marker
        if (!fromInput.value) {
            setFromMarker([latitude, longitude]);
            
            // Reverse geocode to get address
            reverseGeocode(latitude, longitude, function(address) {
                fromInput.value = address;
                fromLatInput.value = latitude;
                fromLngInput.value = longitude;
            });
        }
        // If to is empty, set to marker
        else if (!toInput.value) {
            setToMarker([latitude, longitude]);
            
            // Reverse geocode to get address
            reverseGeocode(latitude, longitude, function(address) {
                toInput.value = address;
                toLatInput.value = latitude;
                toLngInput.value = longitude;
                
                // Draw route
                drawRoute();
            });
        }
    });

    // From input change event
    fromInput.addEventListener('change', function() {
        var address = this.value;
        
        if (address) {
            // Geocode address to get coordinates
            geocode(address, function(lat, lng) {
                setFromMarker([lat, lng]);
                fromLatInput.value = lat;
                fromLngInput.value = lng;
                
                // If to marker exists, draw route
                if (toMarker) {
                    drawRoute();
                }
            });
        } else {
            // Remove from marker if input is empty
            if (fromMarker) {
                map.removeLayer(fromMarker);
                fromMarker = null;
            }
        }
    });

    // To input change event
    toInput.addEventListener('change', function() {
        var address = this.value;
        
        if (address) {
            // Geocode address to get coordinates
            geocode(address, function(lat, lng) {
                setToMarker([lat, lng]);
                toLatInput.value = lat;
                toLngInput.value = lng;
                
                // If from marker exists, draw route
                if (fromMarker) {
                    drawRoute();
                }
            });
        } else {
            // Remove to marker if input is empty
            if (toMarker) {
                map.removeLayer(toMarker);
                toMarker = null;
            }
        }
    });

    // Set from marker
    function setFromMarker(latlng) {
        // Remove existing marker if any
        if (fromMarker) {
            map.removeLayer(fromMarker);
        }
        
        // Create new marker
        fromMarker = L.marker(latlng, {
            draggable: true,
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: '<div class="marker-pin from-pin"></div><i class="fa fa-map-marker"></i>',
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            })
        }).addTo(map);
        
        // Marker drag event
        fromMarker.on('dragend', function(e) {
            var latlng = e.target.getLatLng();
            
            // Reverse geocode to get address
            reverseGeocode(latlng.lat, latlng.lng, function(address) {
                fromInput.value = address;
                fromLatInput.value = latlng.lat;
                fromLngInput.value = latlng.lng;
                
                // If to marker exists, draw route
                if (toMarker) {
                    drawRoute();
                }
            });
        });
        
        // Center map on marker
        map.setView(latlng, map.getZoom());
    }

    // Set to marker
    function setToMarker(latlng) {
        // Remove existing marker if any
        if (toMarker) {
            map.removeLayer(toMarker);
        }
        
        // Create new marker
        toMarker = L.marker(latlng, {
            draggable: true,
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: '<div class="marker-pin to-pin"></div><i class="fa fa-map-marker"></i>',
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            })
        }).addTo(map);
        
        // Marker drag event
        toMarker.on('dragend', function(e) {
            var latlng = e.target.getLatLng();
            
            // Reverse geocode to get address
            reverseGeocode(latlng.lat, latlng.lng, function(address) {
                toInput.value = address;
                toLatInput.value = latlng.lat;
                toLngInput.value = latlng.lng;
                
                // If from marker exists, draw route
                if (fromMarker) {
                    drawRoute();
                }
            });
        });
        
        // Fit map to include both markers
        if (fromMarker) {
            var bounds = L.latLngBounds(fromMarker.getLatLng(), toMarker.getLatLng());
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView(latlng, map.getZoom());
        }
    }

    // Draw route between markers
    function drawRoute() {
        // Remove existing route if any
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        
        // Get coordinates
        var fromLatLng = fromMarker.getLatLng();
        var toLatLng = toMarker.getLatLng();
        
        // Create route line
        routeLine = L.polyline([fromLatLng, toLatLng], {
            color: '#FFD700',
            weight: 5,
            opacity: 0.7,
            dashArray: '10, 10',
            lineJoin: 'round'
        }).addTo(map);
        
        // Fit map to include route
        var bounds = L.latLngBounds(fromLatLng, toLatLng);
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Geocode address to coordinates
    function geocode(address, callback) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    var lat = parseFloat(data[0].lat);
                    var lng = parseFloat(data[0].lon);
                    callback(lat, lng);
                }
            })
            .catch(error => console.error('Error geocoding address:', error));
    }

    // Reverse geocode coordinates to address
    function reverseGeocode(lat, lng, callback) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    callback(data.display_name);
                }
            })
            .catch(error => console.error('Error reverse geocoding:', error));
    }
});