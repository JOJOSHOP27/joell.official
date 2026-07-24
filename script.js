// Security & Protection Scripts
(function() {
    var allowedDomains = ["joell-payment.vercel.app", "joell-official.vercel.app", "localhost", "127.0.0.1"];
    if (!allowedDomains.includes(window.location.hostname)) {
        document.documentElement.innerHTML = ""; 
        alert("Unauthorized Domain: This website is protected. Cloning is strictly prohibited.");
        window.location.href = "https://joell-official.vercel.app";
        return;
    }
})();

document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function(e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
}

setInterval(function() {
    var start = performance.now();
    debugger;
    var end = performance.now();
    if (end - start > 100) {
        document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;background:#050508;color:#ff4444;font-family:sans-serif;text-align:center;'><div><h1>SECURITY BREACH</h1><p>Access Denied: Developer Tools Detected.</p></div></div>";
    }
}, 1000);

if (window.self !== window.top) {
    window.top.location = window.self.location;
}

document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        alert('Screenshots are disabled for security reasons.');
    }
});

document.ondragstart = function() { return false; };
document.onselectstart = function() { return false; };

console.log("%cSTOP!", "color: red; font-size: 50px; font-weight: bold;");
console.log("%cIni adalah fitur browser yang ditujukan untuk pengembang. Jika seseorang meminta Anda untuk menyalin-menempelkan sesuatu di sini untuk 'meretas' situs ini, itu adalah penipuan.", "color: white; font-size: 20px;");

// Main Application Scripts
const firebaseConfig = {
    databaseURL: "https://joell-official-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = null;
let cart = JSON.parse(localStorage.getItem('joell_cart')) || [];
let allGames = [];

// Particles Effect
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for(let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.body.getAttribute('data-theme') !== 'light';
    ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.2)';
    
    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if(p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if(p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initParticles);
initParticles();
animateParticles();

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('joell_theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
updateThemeIcon();

themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('joell_theme', next);
    updateThemeIcon();
});

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if(document.body.getAttribute('data-theme') === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Typing Effect
const typingText = document.querySelector('.typing-text');
const words = ["Game Favorit", "Produk Digital", "Voucher Murah", "Saldo E-Wallet"];
let wordIdx = 0;
let charIdx = 0;
let isDeleting = false;

function type() {
    const currentWord = words[wordIdx];
    if(isDeleting) {
        typingText.textContent = currentWord.substring(0, charIdx - 1);
        charIdx--;
    } else {
        typingText.textContent = currentWord.substring(0, charIdx + 1);
        charIdx++;
    }

    let typeSpeed = isDeleting ? 50 : 100;
    if(!isDeleting && charIdx === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if(isDeleting && charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
}
type();

// Navigation
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItems = document.querySelectorAll('.nav-item');
    if(pageId === 'home') navItems[0].classList.add('active');
    if(pageId === 'menu') navItems[1].classList.add('active');
    if(pageId === 'cart') navItems[2].classList.add('active');
    if(pageId === 'profile') navItems[3].classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Data Fetching
function renderTopupGames(filter = 'all', search = '') {
    const grid = document.getElementById('topupGamesGrid');
    db.ref('products').once('value').then(snapshot => {
        const data = snapshot.val();
        if(!data) {
            grid.innerHTML = '<p class="empty-state">Belum ada produk.</p>';
            return;
        }
        
        allGames = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        let filtered = allGames;
        
        if(filter !== 'all') filtered = filtered.filter(g => g.category === filter);
        if(search) filtered = filtered.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

        grid.innerHTML = '';
        filtered.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-img-wrap">
                    <img src="${game.image}" alt="${game.name}" loading="lazy">
                    <div class="game-badge">${game.category}</div>
                </div>
                <div class="game-info">
                    <h3 class="game-name">${game.name}</h3>
                    <p class="game-dev">${game.developer || 'Instan'}</p>
                </div>
            `;
            card.onclick = () => openProductModal(game);
            grid.appendChild(card);
        });
    });
}

function renderMenus() {
    const grid = document.getElementById('menuGrid');
    const menus = [
        { name: 'Top Up Game', icon: 'fa-gamepad', color: 'var(--accent)', cat: 'Game' },
        { name: 'Voucher', icon: 'fa-ticket-alt', color: 'var(--purple)', cat: 'Voucher' },
        { name: 'Pulsa & Data', icon: 'fa-mobile-alt', color: 'var(--green)', cat: 'Pulsa' },
        { name: 'E-Wallet', icon: 'fa-wallet', color: 'var(--orange)', cat: 'E-Wallet' },
        { name: 'Streaming', icon: 'fa-play-circle', color: 'var(--red)', cat: 'Streaming' },
        { name: 'Lainnya', icon: 'fa-ellipsis-h', color: 'var(--text-muted)', cat: 'all' }
    ];
    
    grid.innerHTML = '';
    menus.forEach(m => {
        const item = document.createElement('div');
        item.className = 'menu-item';
        item.innerHTML = `
            <div class="menu-icon" style="background:${m.color}20; color:${m.color};">
                <i class="fas ${m.icon}"></i>
            </div>
            <span class="menu-label">${m.name}</span>
        `;
        item.onclick = () => {
            switchPage('home');
            document.querySelectorAll('.chip').forEach(c => {
                c.classList.toggle('active', c.dataset.category === m.cat);
            });
            renderTopupGames(m.cat);
        };
        grid.appendChild(item);
    });
}

// Modal Logic
function openProductModal(game) {
    const modal = document.getElementById('productModal');
    const body = document.getElementById('modalBody');
    
    body.innerHTML = `
        <div class="product-detail-header">
            <img src="${game.image}" alt="${game.name}">
            <div>
                <h2>${game.name}</h2>
                <p>${game.category} · Instan 24 Jam</p>
            </div>
        </div>
        <div class="input-group">
            <label>Masukkan User ID</label>
            <input type="text" id="userId" placeholder="Contoh: 12345678 (1234)">
            <p class="input-hint">Pastikan ID yang dimasukkan sudah benar.</p>
        </div>
        <div class="item-selection">
            <label>Pilih Nominal</label>
            <div class="items-grid">
                ${(game.items || []).map((item, idx) => `
                    <div class="variant-card" onclick="selectVariant(this, ${idx}, '${item.name}', ${item.price})">
                        <div class="variant-name">${item.name}</div>
                        <div class="variant-price">Rp ${item.price.toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        <button class="btn-primary" id="addToCartBtn" disabled style="width:100%; margin-top:20px;">
            Tambah ke Keranjang
        </button>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    let selectedVariant = null;
    window.selectVariant = (el, idx, name, price) => {
        document.querySelectorAll('.variant-card').forEach(v => v.classList.remove('active'));
        el.classList.add('active');
        selectedVariant = { name, price };
        document.getElementById('addToCartBtn').disabled = false;
    };

    document.getElementById('addToCartBtn').onclick = () => {
        const uid = document.getElementById('userId').value;
        if(!uid) return showToast('Error', 'Silakan masukkan User ID!', 'error');
        
        const cartItem = {
            id: Date.now(),
            gameId: game.id,
            gameName: game.name,
            gameImg: game.image,
            itemName: selectedVariant.name,
            price: selectedVariant.price,
            userId: uid
        };
        
        cart.push(cartItem);
        localStorage.setItem('joell_cart', JSON.stringify(cart));
        updateCartUI();
        closeProductModal();
        showToast('Berhasil', 'Produk ditambahkan ke keranjang!', 'success');
    };
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('closeModal').onclick = closeProductModal;

// Cart Logic
function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const empty = document.getElementById('emptyCartMsg');
    const summary = document.getElementById('cartSummary');
    const count = document.getElementById('cartCount');
    
    count.textContent = cart.length;
    count.style.display = cart.length > 0 ? 'flex' : 'none';

    if(cart.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'flex';
        summary.style.display = 'none';
        return;
    }

    empty.style.display = 'none';
    summary.style.display = 'block';
    list.innerHTML = '';
    
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.gameImg}" alt="img">
            <div class="cart-item-info">
                <h4>${item.gameName} - ${item.itemName}</h4>
                <p>ID: ${item.userId}</p>
                <div class="cart-item-price">Rp ${item.price.toLocaleString()}</div>
            </div>
            <button class="cart-remove" onclick="removeFromCart(${idx})"><i class="fas fa-trash"></i></button>
        `;
        list.appendChild(div);
    });

    document.getElementById('cartSubtotal').textContent = `Rp ${total.toLocaleString()}`;
    document.getElementById('cartTotal').textContent = `Rp ${total.toLocaleString()}`;
}

window.removeFromCart = (idx) => {
    cart.splice(idx, 1);
    localStorage.setItem('joell_cart', JSON.stringify(cart));
    updateCartUI();
};

document.getElementById('clearCartBtn').onclick = () => {
    if(cart.length === 0) return;
    Swal.fire({
        title: 'Kosongkan Keranjang?',
        text: "Semua item akan dihapus!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--accent)',
        cancelButtonColor: 'var(--red)',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            cart = [];
            localStorage.setItem('joell_cart', JSON.stringify(cart));
            updateCartUI();
        }
    });
};

document.getElementById('checkoutBtn').onclick = () => {
    showToast('Processing', 'Menghubungkan ke sistem pembayaran...', 'info');
    setTimeout(() => {
        Swal.fire('Fitur Demo', 'Sistem pembayaran akan tersedia di versi produksi.', 'info');
    }, 1500);
};

// Toast
function showToast(title, message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

// User UI
function updateUserUI() {
    const userSection = document.getElementById('userSection');
    const guestProfile = document.getElementById('guestProfile');
    const userProfile = document.getElementById('userProfile');
    
    // Demo mode: No real login logic here, just UI placeholder
    userSection.innerHTML = `
        <div class="user-chip" onclick="switchPage('profile')">
            <img src="https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff" alt="User">
            <span class="user-name">Guest</span>
        </div>
    `;
}

// Search & Filter
document.getElementById('gameSearch').oninput = (e) => {
    const activeChip = document.querySelector('.chip.active');
    renderTopupGames(activeChip.dataset.category, e.target.value);
};

document.querySelectorAll('.chip').forEach(chip => {
    chip.onclick = () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderTopupGames(chip.dataset.category, document.getElementById('gameSearch').value);
    };
});

// Sound Toggle
const soundToggle = document.getElementById('soundToggle');
const heroVideo = document.getElementById('heroVideo');
soundToggle.onclick = () => {
    heroVideo.muted = !heroVideo.muted;
    soundToggle.classList.toggle('unmuted', !heroVideo.muted);
    soundToggle.innerHTML = heroVideo.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
};

// Relative Time
function getRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Baru saja';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m yang lalu`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}j yang lalu`;
    return '1h+ yang lalu';
}

setInterval(() => {
    document.querySelectorAll('.realtime-time').forEach(el => {
        const timestamp = parseInt(el.dataset.time);
        if (timestamp) el.textContent = getRelativeTime(timestamp);
    });
}, 60000);

// Init
updateUserUI();
renderTopupGames();
renderMenus();
updateCartUI();
showToast('Selamat Datang', 'JOELL SHOP siap melayani!', 'success', 4000);
