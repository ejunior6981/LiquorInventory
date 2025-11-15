


export class BarcodeScanner {
    constructor(elementId) {
        this.elementId = elementId;
        this.scanner = null;
        this.isScanning = false;
    }

    async init() {
        if (this.isScanning) return;

        // Check for camera permissions
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error('Camera access error:', err);
            return;
        }

        // Initialize Quagga
        this.scanner = document.getElementById(this.elementId);

        if (!this.scanner) {
            console.error(`Element with ID ${this.elementId} not found`);
            return;
        }

        Quagga.init({
            inputStream: {
                name: 'Live',
                type: 'LiveStream',
                target: this.elementId
            },
            decoder: {
                readers: ['code_128', 'ean_reader']
            }
        }, (err) => {
            if (err) {
                console.error('Quagga initialization error:', err);
                return;
            }

            Quagga.start();
            this.isScanning = true;

            Quagga.onDetected((data) => {
                this.handleBarcodeDetected(data);
            });
        });
    }

    handleBarcodeDetected(data) {
        console.log('Barcode detected:', data.codeResult.code);

        // Emit event or callback
        const event = new CustomEvent('barcodeScanned', { detail: data.codeResult.code });

        if (this.scanner) {
            this.scanner.dispatchEvent(event);
        }

        // Stop scanning after detection to allow UI interaction
        Quagga.stop();
        this.isScanning = false;
    }

    stop() {
        if (this.isScanning && Quagga) {
            Quagga.stop();
            this.isScanning = false;
        }
    }
}


