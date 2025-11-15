

import { registerSW } from './sw-registration.js';
import { BarcodeScanner } from './barcode-scanner.js';

// Register the service worker
registerSW();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Liquor Inventory System loaded');

    // Initialize barcode scanner
    const scanner = new BarcodeScanner('interactive');
    const scanButton = document.getElementById('scan-button');
    const barcodeInput = document.getElementById('barcode');
    const resultDisplay = document.getElementById('result-display');

    // Set up event listeners for barcode scanning
    scanButton.addEventListener('click', () => {
        scanner.init();
        resultDisplay.textContent = 'Scanning...';
    });

    // Handle barcode detection
    if (scanner.scanner) {
        scanner.scanner.addEventListener('barcodeScanned', (event) => {
            const barcodeValue = event.detail;
            barcodeInput.value = barcodeValue;
            resultDisplay.textContent = `Barcode scanned: ${barcodeValue}`;
            scanner.stop();
        });
    }

    // Initialize inventory system
    initInventorySystem();

    // Start service worker registration
    registerSW();
});

function initInventorySystem() {
    const form = document.getElementById('inventory-form');
    const inventoryList = document.getElementById('inventory-items');

    let inventory = [];

    // Load any existing inventory from localStorage
    const savedInventory = localStorage.getItem('liquorInventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
        renderInventory();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const barcode = document.getElementById('barcode').value;
        const name = document.getElementById('name').value;
        const brand = document.getElementById('brand').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value);

        if (!name || !brand || isNaN(quantity) || isNaN(price)) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        // Add to inventory
        const newItem = {
            barcode,
            name,
            brand,
            quantity,
            price,
            totalCost: (quantity * price).toFixed(2)
        };

        inventory.push(newItem);

        // Save to localStorage
        localStorage.setItem('liquorInventory', JSON.stringify(inventory));

        // Clear form
        form.reset();

        // Update UI
        renderInventory();
    });

    function renderInventory() {
        inventoryList.innerHTML = '';

        if (inventory.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No items in inventory';
            inventoryList.appendChild(li);
            return;
        }

        inventory.forEach(item => {
            const li = document.createElement('li');

            const itemDetails = `
                <span class="item-name">${item.name} (${item.brand})</span>
                <span class="item-info">
                    Qty: ${item.quantity}, Price: $${item.price.toFixed(2)}
                    <br>Total: $${item.totalCost}
                </span>
            `;

            li.innerHTML = itemDetails;
            inventoryList.appendChild(li);
        });
    }
}
