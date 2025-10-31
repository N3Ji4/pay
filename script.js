// Payment data dengan nomor yang berbeda
const paymentData = {
    gopay: {
        number: '08551271103',
        name: 'Your Name',
        app: 'Gojek',
        feature: 'Gopay',
        color: 'gopay',
        type: 'number'
    },
    ovo: {
        number: '085694458024', 
        name: 'Your Name',
        app: 'OVO',
        feature: 'OVO Money',
        color: 'ovo',
        type: 'number'
    },
    dana: {
        number: '085694458024',
        name: 'Your Name', 
        app: 'Dana',
        feature: 'Dana',
        color: 'dana',
        type: 'number'
    },
    qris: {
        number: 'Scan QR Code Below',
        name: 'Your Name',
        app: 'Any E-Wallet',
        feature: 'QRIS',
        color: 'qris',
        type: 'qris',
        qrImage: 'qris-code.jpg', // Ganti dengan path gambar QRIS kamu
        enabled: false // Ubah jadi true ketika QRIS sudah ready
    }
};

class PaymentGateway {
    constructor() {
        this.currentMethod = 'gopay';
        this.init();
    }

    init() {
        this.initPaymentMethods();
        this.updatePaymentDisplay();
        this.checkQRISStatus();
        this.initTheme();
        this.initAnimations();
    }

    // Theme functionality
    initTheme() {
        // Check for saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Add theme toggle button if needed
        this.createThemeToggle();
    }

    createThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Add to header
        const header = document.querySelector('.header');
        header.appendChild(themeToggle);
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const themeIcon = document.querySelector('.theme-toggle i');
        themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        this.showNotification(`Theme changed to ${newTheme} mode`, 'info');
    }

    // QRIS Status Check
    checkQRISStatus() {
        const qrisData = paymentData.qris;
        const qrisCard = document.querySelector('[data-method="qris"]');
        
        if (qrisData.enabled) {
            // QRIS sudah aktif - hapus coming soon
            qrisCard.classList.remove('coming-soon');
            const comingSoonBadge = qrisCard.querySelector('.coming-soon-badge');
            if (comingSoonBadge) {
                comingSoonBadge.remove();
            }
            
            // Tambah checkmark jika belum ada
            if (!qrisCard.querySelector('.method-check')) {
                const checkHTML = `<div class="method-check"><i class="fas fa-check-circle"></i></div>`;
                qrisCard.innerHTML += checkHTML;
            }
        }
    }

    // Payment Methods Initialization
    initPaymentMethods() {
        const methodCards = document.querySelectorAll('.method-card');
        
        methodCards.forEach(card => {
            const method = card.dataset.method;
            const methodData = paymentData[method];
            
            // Skip cards yang masih coming soon (tapi tetap bisa diklik untuk preview)
            if (card.classList.contains('coming-soon') && !methodData.enabled) {
                card.addEventListener('click', () => {
                    this.showComingSoonNotification();
                });
            } else {
                card.addEventListener('click', () => {
                    this.switchPaymentMethod(method);
                });
            }

            // Add hover effects
            card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
            card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
        });
    }

    handleCardHover(card, isHovering) {
        if (!card.classList.contains('active') && !card.classList.contains('coming-soon')) {
            if (isHovering) {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
            } else {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            }
        }
    }

    switchPaymentMethod(method) {
        // Remove active class from all cards
        document.querySelectorAll('.method-card').forEach(card => {
            card.classList.remove('active');
        });

        // Add active class to selected card
        const selectedCard = document.querySelector(`[data-method="${method}"]`);
        selectedCard.classList.add('active');
        
        // Update current method
        this.currentMethod = method;
        
        // Update payment display
        this.updatePaymentDisplay();
        
        // Add animation effect
        this.animateMethodChange(selectedCard);
        
        // Log activity
        console.log(`Payment method switched to: ${method}`);
    }

    updatePaymentDisplay() {
        const data = paymentData[this.currentMethod];
        const paymentDetails = document.querySelector('.payment-details');
        
        // Update payment number section berdasarkan type
        if (data.type === 'qris' && data.enabled) {
            this.showQRISDisplay(data);
        } else {
            this.showNumberDisplay(data);
        }
        
        // Update account name
        document.getElementById('accountName').textContent = data.name;
        
        // Update method badge
        this.updateMethodBadge(data);
        
        // Update instructions
        this.updateInstructions(data);
    }

    showNumberDisplay(data) {
        const paymentInfo = document.querySelector('.payment-info');
        
        paymentInfo.innerHTML = `
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-phone"></i>
                    Nomor Pembayaran
                </div>
                <div class="info-value">
                    <span id="paymentNumber">${data.number}</span>
                    <button class="copy-btn" onclick="copyToClipboard()">
                        <i class="fas fa-copy"></i>
                        Copy
                    </button>
                </div>
            </div>

            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-user"></i>
                    Nama Penerima
                </div>
                <div class="info-value">
                    <span id="accountName">${data.name}</span>
                </div>
            </div>

            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-info-circle"></i>
                    Status
                </div>
                <div class="info-value status-available">
                    <i class="fas fa-check-circle"></i>
                    Tersedia
                </div>
            </div>
        `;
    }

    showQRISDisplay(data) {
        const paymentInfo = document.querySelector('.payment-info');
        
        paymentInfo.innerHTML = `
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-qrcode"></i>
                    QR Code Pembayaran
                </div>
                <div class="info-value">
                    <span>Scan QR Code Below</span>
                </div>
            </div>

            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-user"></i>
                    Nama Penerima
                </div>
                <div class="info-value">
                    <span id="accountName">${data.name}</span>
                </div>
            </div>

            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-info-circle"></i>
                    Status
                </div>
                <div class="info-value status-available">
                    <i class="fas fa-check-circle"></i>
                    Tersedia
                </div>
            </div>
        `;

        // Update instructions untuk QRIS
        this.updateQRISInstructions(data);
    }

    updateMethodBadge(data) {
        const methodBadge = document.getElementById('currentMethod');
        methodBadge.className = `method-badge ${data.color}`;
        methodBadge.innerHTML = `
            <i class="fas fa-${this.getMethodIcon(this.currentMethod)}"></i>
            ${this.currentMethod.toUpperCase()}
        `;
    }

    updateInstructions(data) {
        const instructions = document.querySelector('.instructions');
        
        if (data.type === 'qris' && data.enabled) {
            this.updateQRISInstructions(data);
        } else {
            instructions.innerHTML = `
                <h4>Cara Pembayaran:</h4>
                <ol>
                    <li>Buka aplikasi <strong>${data.app}</strong></li>
                    <li>Pilih <strong>${data.feature}</strong></li>
                    <li>Masukkan nomor <strong>${data.number}</strong></li>
                    <li>Konfirmasi pembayaran</li>
                </ol>
            `;
        }
    }

    updateQRISInstructions(data) {
        const instructions = document.querySelector('.instructions');
        instructions.innerHTML = `
            <div class="qris-display">
                <div class="qris-image-container">
                    <img src="${data.qrImage}" alt="QRIS Payment Code" class="qris-image" onerror="this.style.display='none'; document.querySelector('.qris-fallback').style.display='block'">
                    <div class="qris-fallback" style="display: none;">
                        <i class="fas fa-qrcode" style="font-size: 80px; color: #ccc; margin-bottom: 15px;"></i>
                        <p>QR Code tidak dapat dimuat</p>
                        <p style="font-size: 12px; color: #999;">Pastikan file '${data.qrImage}' ada di folder yang sama</p>
                    </div>
                    <div class="qris-overlay">
                        <i class="fas fa-expand"></i>
                        Click to Zoom
                    </div>
                </div>
                <div class="qris-instructions">
                    <h4>Cara Bayar dengan QRIS:</h4>
                    <ol>
                        <li>Buka aplikasi <strong>${data.app}</strong></li>
                        <li>Pilih fitur <strong>Scan QR Code</strong></li>
                        <li>Arahkan kamera ke QR code di atas</li>
                        <li>Konfirmasi jumlah pembayaran</li>
                        <li>Selesai! Pembayaran diproses otomatis</li>
                    </ol>
                </div>
            </div>
        `;

        // Add click to zoom functionality
        this.initQRISZoom();
    }

    initQRISZoom() {
        const qrisImage = document.querySelector('.qris-image-container');
        if (qrisImage) {
            qrisImage.addEventListener('click', () => {
                this.showQRISModal();
            });
        }
    }

    showQRISModal() {
        const data = paymentData.qris;
        
        const modal = document.createElement('div');
        modal.className = 'modal