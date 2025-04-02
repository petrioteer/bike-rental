document.addEventListener('DOMContentLoaded', function() {
    // Sample fleet data - in a real application, this would come from the database
    const fleetItems = [
        {
            id: 1,
            name: 'Vespa Primavera',
            category: 'Scooter',
            image: './assets/fleet/vespa-primavera.jpg',
            hourlyRate: 15,
            dailyRate: 75
        },
        {
            id: 2,
            name: 'Honda Activa',
            category: 'Scooter',
            image: './assets/fleet/honda-activa.jpg',
            hourlyRate: 12,
            dailyRate: 60
        },
        {
            id: 3,
            name: 'Yamaha Fascino',
            category: 'Scooter',
            image: './assets/fleet/yamaha-fascino.jpg',
            hourlyRate: 13,
            dailyRate: 65
        },
        {
            id: 4,
            name: 'Trek FX 3',
            category: 'Bicycle',
            image: './assets/fleet/trek-fx3.jpg',
            hourlyRate: 8,
            dailyRate: 40
        },
        {
            id: 5,
            name: 'Specialized Sirrus',
            category: 'Bicycle',
            image: './assets/fleet/specialized-sirrus.jpg',
            hourlyRate: 9,
            dailyRate: 45
        }
    ];

    // Get the carousel container
    const carouselContainer = document.querySelector('.fleet-carousel');
    
    // Only display the first 3 items in the preview
    const previewItems = fleetItems.slice(0, 3);
    
    // Create HTML for each fleet item
    previewItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'fleet-item';
        itemElement.innerHTML = `
            <div class="relative overflow-hidden rounded-lg bg-gray-800 p-4 m-2 w-64 transition-all hover:scale-105">
                <img src="${item.image}" alt="${item.name}" class="w-full h-40 object-cover rounded mb-4">
                <h3 class="text-xl font-semibold text-yellow-400">${item.name}</h3>
                <p class="text-gray-300">${item.category}</p>
                <div class="mt-2">
                    <span class="text-white">$${item.hourlyRate}/hour</span>
                    <span class="text-gray-400 ml-2">$${item.dailyRate}/day</span>
                </div>
                <a href="book.html?id=${item.id}" class="block mt-4 text-center bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded transition-colors">
                    Rent Now
                </a>
            </div>
        `;
        carouselContainer.appendChild(itemElement);
    });
});