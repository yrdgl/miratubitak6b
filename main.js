// ==========================================
// SAYFA NAVİGASYONU
// ==========================================

function navigateTo(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// ==========================================
// DENEY 1: RENKLİ KARTON DENEYİ
// ==========================================

const experiment1 = {
    cartons: [
        { color: 'Siyah', hex: '#1A1A1A', startTemp: 22, targetTemp: 37, currentTemp: 22, time: 0 },
        { color: 'Beyaz', hex: '#FFFFFF', startTemp: 22, targetTemp: 26, currentTemp: 22, time: 0 },
        { color: 'Kırmızı', hex: '#FF6B6B', startTemp: 22, targetTemp: 31, currentTemp: 22, time: 0 },
        { color: 'Mavi', hex: '#4DABF7', startTemp: 22, targetTemp: 29, currentTemp: 22, time: 0 },
        { color: 'Yeşil', hex: '#51CF66', startTemp: 22, targetTemp: 30, currentTemp: 22, time: 0 }
    ],
    isRunning: false,
    isPaused: false,
    speed: 1,
    elapsedTime: 0,
    duration: 25,
    animationFrame: null,
    lastTimestamp: 0,
    canvas: null,
    ctx: null,
    sunRays: [],

    init() {
        this.canvas = document.getElementById('exp1-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.createCartonElements();
        this.initSunRays();
    },

    createCartonElements() {
        const container = document.getElementById('exp1-cartons');
        container.innerHTML = '';
        
        this.cartons.forEach((carton, index) => {
            const item = document.createElement('div');
            item.className = 'carton-item';
            item.innerHTML = `
                <div class="thermometer" id="thermo-${index}">${carton.currentTemp.toFixed(1)}°C</div>
                <div class="carton" id="carton-${index}" style="background-color: ${carton.hex}; ${carton.color === 'Beyaz' ? 'border: 2px solid #E2E8F0;' : ''}"></div>
                <div class="carton-label">${carton.color}</div>
            `;
            container.appendChild(item);
        });
    },

    initSunRays() {
        for (let i = 0; i < 30; i++) {
            this.sunRays.push({
                x: Math.random() * this.canvas.width,
                y: -Math.random() * 200,
                length: 40 + Math.random() * 60,
                speed: 2 + Math.random() * 3,
                opacity: 0.1 + Math.random() * 0.3,
                angle: Math.PI / 2 + (Math.random() - 0.5) * 0.5
            });
        }
    },

    drawSunRays() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.isRunning || this.isPaused) return;

        this.sunRays.forEach(ray => {
            this.ctx.save();
            this.ctx.translate(ray.x, ray.y);
            this.ctx.rotate(ray.angle);
            
            const gradient = this.ctx.createLinearGradient(0, 0, 0, ray.length);
            gradient.addColorStop(0, `rgba(255, 200, 100, ${ray.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, ray.length);
            this.ctx.stroke();
            
            this.ctx.restore();
            
            ray.y += ray.speed * this.speed;
            if (ray.y > this.canvas.height + 100) {
                ray.y = -100;
                ray.x = Math.random() * this.canvas.width;
            }
        });
    },

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        document.getElementById('exp1-start').disabled = true;
        document.getElementById('exp1-pause').disabled = false;
        
        this.lastTimestamp = performance.now();
        this.animate(this.lastTimestamp);
    },

    pause() {
        this.isPaused = true;
        document.getElementById('exp1-start').disabled = false;
        document.getElementById('exp1-pause').disabled = true;
    },

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.elapsedTime = 0;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.cartons.forEach(carton => {
            carton.currentTemp = carton.startTemp;
            carton.time = 0;
        });
        
        this.createCartonElements();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        document.getElementById('exp1-start').disabled = false;
        document.getElementById('exp1-pause').disabled = true;
        document.getElementById('exp1-timer').textContent = '0.0s';
    },

    setSpeed(speed) {
        this.speed = speed;
        document.querySelectorAll('#experiment1 .speed-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    },

    animate(timestamp) {
        if (!this.isRunning) return;
        
        if (!this.isPaused) {
            const deltaTime = (timestamp - this.lastTimestamp) / 1000;
            this.elapsedTime += deltaTime * this.speed;
            
            let allComplete = true;
            
            this.cartons.forEach((carton, index) => {
                if (carton.currentTemp < carton.targetTemp) {
                    allComplete = false;
                    
                    const progress = Math.min(this.elapsedTime / this.duration, 1);
                    carton.currentTemp = carton.startTemp + (carton.targetTemp - carton.startTemp) * progress;
                    
                    if (carton.currentTemp >= carton.targetTemp) {
                        carton.currentTemp = carton.targetTemp;
                        carton.time = this.elapsedTime;
                    }
                    
                    document.getElementById(`thermo-${index}`).textContent = `${carton.currentTemp.toFixed(1)}°C`;
                    document.getElementById(`carton-${index}`).classList.add('heating');
                } else {
                    document.getElementById(`carton-${index}`).classList.remove('heating');
                }
            });
            
            document.getElementById('exp1-timer').textContent = `${this.elapsedTime.toFixed(1)}s`;
            
            this.drawSunRays();
            
            if (allComplete) {
                this.isRunning = false;
                showResults('experiment1');
                return;
            }
        }
        
        this.lastTimestamp = timestamp;
        this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
    }
};

// ==========================================
// DENEY 2: SU DEPOSU MODELİ
// ==========================================

const experiment2 = {
    containers: [
        { color: 'Siyah', hex: '#1A1A1A', startTemp: 22, targetTemp: 34, currentTemp: 22, time: 0 },
        { color: 'Beyaz', hex: '#FFFFFF', startTemp: 22, targetTemp: 26, currentTemp: 22, time: 0 },
        { color: 'Şeffaf', hex: 'rgba(200, 230, 255, 0.3)', startTemp: 22, targetTemp: 30, currentTemp: 22, time: 0, transparent: true }
    ],
    isRunning: false,
    isPaused: false,
    speed: 1,
    elapsedTime: 0,
    duration: 25,
    animationFrame: null,
    lastTimestamp: 0,
    canvas: null,
    ctx: null,
    sunRays: [],

    init() {
        this.canvas = document.getElementById('exp2-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.createContainerElements();
        this.initSunRays();
    },

    createContainerElements() {
        const wrapper = document.getElementById('exp2-containers');
        wrapper.innerHTML = '';
        
        this.containers.forEach((container, index) => {
            const item = document.createElement('div');
            item.className = 'container-item';
            
            const borderStyle = container.transparent ? 'border: 3px solid rgba(100, 150, 200, 0.5);' : '';
            const bgColor = container.transparent ? 'background: rgba(230, 240, 250, 0.2);' : `background-color: ${container.hex};`;
            
            item.innerHTML = `
                <div class="thermometer" id="thermo2-${index}">${container.currentTemp.toFixed(1)}°C</div>
                <div class="water-container" id="container-${index}" style="${bgColor} ${borderStyle}">
                    <div class="water-level" id="water-${index}"></div>
                    <div class="water-surface" id="surface-${index}"></div>
                </div>
                <div class="carton-label">${container.color} Kap</div>
            `;
            wrapper.appendChild(item);
            
            this.createBubbles(index);
        });
    },

    createBubbles(containerIndex) {
        const surface = document.getElementById(`surface-${containerIndex}`);
        for (let i = 0; i < 8; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.left = `${20 + Math.random() * 60}%`;
            bubble.style.width = `${4 + Math.random() * 8}px`;
            bubble.style.height = bubble.style.width;
            bubble.style.bottom = '0';
            bubble.style.animationDelay = `${Math.random() * 3}s`;
            bubble.style.animationDuration = `${3 + Math.random() * 2}s`;
            surface.appendChild(bubble);
        }
    },

    initSunRays() {
        for (let i = 0; i < 30; i++) {
            this.sunRays.push({
                x: Math.random() * this.canvas.width,
                y: -Math.random() * 200,
                length: 40 + Math.random() * 60,
                speed: 2 + Math.random() * 3,
                opacity: 0.1 + Math.random() * 0.3,
                angle: Math.PI / 2 + (Math.random() - 0.5) * 0.5
            });
        }
    },

    drawSunRays() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.isRunning || this.isPaused) return;

        this.sunRays.forEach(ray => {
            this.ctx.save();
            this.ctx.translate(ray.x, ray.y);
            this.ctx.rotate(ray.angle);
            
            const gradient = this.ctx.createLinearGradient(0, 0, 0, ray.length);
            gradient.addColorStop(0, `rgba(255, 200, 100, ${ray.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, ray.length);
            this.ctx.stroke();
            
            this.ctx.restore();
            
            ray.y += ray.speed * this.speed;
            if (ray.y > this.canvas.height + 100) {
                ray.y = -100;
                ray.x = Math.random() * this.canvas.width;
            }
        });
    },

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        document.getElementById('exp2-start').disabled = true;
        document.getElementById('exp2-pause').disabled = false;
        
        this.lastTimestamp = performance.now();
        this.animate(this.lastTimestamp);
    },

    pause() {
        this.isPaused = true;
        document.getElementById('exp2-start').disabled = false;
        document.getElementById('exp2-pause').disabled = true;
    },

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.elapsedTime = 0;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.containers.forEach(container => {
            container.currentTemp = container.startTemp;
            container.time = 0;
        });
        
        this.createContainerElements();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        document.getElementById('exp2-start').disabled = false;
        document.getElementById('exp2-pause').disabled = true;
        document.getElementById('exp2-timer').textContent = '0.0s';
    },

    setSpeed(speed) {
        this.speed = speed;
        document.querySelectorAll('#experiment2 .speed-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    },

    animate(timestamp) {
        if (!this.isRunning) return;
        
        if (!this.isPaused) {
            const deltaTime = (timestamp - this.lastTimestamp) / 1000;
            this.elapsedTime += deltaTime * this.speed;
            
            let allComplete = true;
            
            this.containers.forEach((container, index) => {
                if (container.currentTemp < container.targetTemp) {
                    allComplete = false;
                    
                    const progress = Math.min(this.elapsedTime / this.duration, 1);
                    container.currentTemp = container.startTemp + (container.targetTemp - container.startTemp) * progress;
                    
                    if (container.currentTemp >= container.targetTemp) {
                        container.currentTemp = container.targetTemp;
                        container.time = this.elapsedTime;
                    }
                    
                    document.getElementById(`thermo2-${index}`).textContent = `${container.currentTemp.toFixed(1)}°C`;
                    
                    // Su seviyesi animasyonu
                    const waterLevel = 70 + (progress * 5);
                    document.getElementById(`water-${index}`).style.height = `${waterLevel}%`;
                }
            });
            
            document.getElementById('exp2-timer').textContent = `${this.elapsedTime.toFixed(1)}s`;
            
            this.drawSunRays();
            
            if (allComplete) {
                this.isRunning = false;
                showResults('experiment2');
                return;
            }
        }
        
        this.lastTimestamp = timestamp;
        this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
    }
};

// ==========================================
// SONUÇ GÖSTERME
// ==========================================

function showResults(experimentType) {
    const modal = document.getElementById('results-modal');
    const content = document.getElementById('results-content');
    
    let html = '';
    
    if (experimentType === 'experiment1') {
        // Siyah karton
        const black = experiment1.cartons.find(c => c.color === 'Siyah');
        const increase1 = (black.targetTemp - black.startTemp).toFixed(1);
        html += `
            <div class="result-section highlight">
                <h3>En Hızlı Isınan – Siyah</h3>
                <p>Siyah karton güneş ışığını en çok emen renktir. Güneşten gelen ışınlar siyah yüzeye çarptığında neredeyse hepsi emilir ve ısıya dönüşür. Bu yüzden siyah karton ${black.time.toFixed(1)} saniyede ${black.targetTemp}°C'ye ulaşarak en hızlı ısınan materyal oldu. Toplam ${increase1}°C sıcaklık artışı gözlemlendi. Günlük hayatta siyah arabaların yazın daha çok ısınması da aynı nedenledir. Güneş enerjisi panellerinin siyah olmasının sebebi budur.</p>
            </div>
        `;
        
        // Beyaz karton
        const white = experiment1.cartons.find(c => c.color === 'Beyaz');
        const increase2 = (white.targetTemp - white.startTemp).toFixed(1);
        html += `
            <div class="result-section highlight">
                <h3>En Yavaş Isınan – Beyaz</h3>
                <p>Beyaz karton güneş ışığını en çok yansıtan renktir. Gelen ışınların büyük kısmı beyaz yüzeyden geri sektiği için ısıya çok az dönüşür. ${white.time.toFixed(1)} saniyede sadece ${increase2}°C ısındı ve en yavaş ısınan materyal oldu. Bu yüzden sıcak bölgelerde evler beyaz boyanır ve yazın beyaz giysiler tercih edilir.</p>
            </div>
        `;
        
        // Kırmızı
        const red = experiment1.cartons.find(c => c.color === 'Kırmızı');
        const increase3 = (red.targetTemp - red.startTemp).toFixed(1);
        html += `
            <div class="result-section">
                <h3>Orta Seviye – Kırmızı</h3>
                <p>Kırmızı karton bazı ışınları emer, bazılarını yansıtır. ${red.targetTemp}°C'ye ulaştı ve ${increase3}°C sıcaklık artışı gösterdi. Isınma hızı orta seviyededir.</p>
            </div>
        `;
        
        // Mavi
        const blue = experiment1.cartons.find(c => c.color === 'Mavi');
        const increase4 = (blue.targetTemp - blue.startTemp).toFixed(1);
        html += `
            <div class="result-section">
                <h3>Orta-Düşük Seviye – Mavi</h3>
                <p>Mavi karton mavi ışığı yansıtır, diğer ışıkları emer. ${increase4}°C artışla ${blue.targetTemp}°C'ye ulaştı. Deniz ve gökyüzünün mavi görünmesinin nedeni budur.</p>
            </div>
        `;
        
        // Yeşil
        const green = experiment1.cartons.find(c => c.color === 'Yeşil');
        const increase5 = (green.targetTemp - green.startTemp).toFixed(1);
        html += `
            <div class="result-section">
                <h3>Orta Seviye – Yeşil</h3>
                <p>Yeşil karton yeşil ışığı yansıtırken diğer renkleri emer. ${increase5}°C artışla orta seviyede ısındı. Bitkilerin yeşil olmasının nedeni budur.</p>
            </div>
        `;
        
        html += `
            <div class="result-section highlight">
                <h3>Deney Sonucu</h3>
                <p>Yüzey renginin güneş ışığını soğurma kapasitesi ile sıcaklık artışı arasında doğrudan ilişki olduğu gözlemlenmiştir. Siyah yüzey en yüksek, beyaz yüzey en düşük ısınmayı göstermiştir.</p>
            </div>
        `;
    } else {
        // Siyah kap
        const black = experiment2.containers.find(c => c.color === 'Siyah');
        const increase1 = (black.targetTemp - black.startTemp).toFixed(1);
        html += `
            <div class="result-section highlight">
                <h3>En Yüksek Isınma – Siyah Kap</h3>
                <p>Siyah kap güneş ışığını en çok emmiş ve suya iletmiştir. ${black.time.toFixed(1)} saniyede ${black.targetTemp}°C'ye ulaşmış ve ${increase1}°C artış göstermiştir. Güneş enerjili su ısıtıcılarının tanklarının siyah olmasının nedeni budur.</p>
            </div>
        `;
        
        // Beyaz kap
        const white = experiment2.containers.find(c => c.color === 'Beyaz');
        const increase2 = (white.targetTemp - white.startTemp).toFixed(1);
        html += `
            <div class="result-section highlight">
                <h3>En Düşük Isınma – Beyaz Kap</h3>
                <p>Beyaz kap ışığı yansıttığı için su çok az ısınmıştır. ${increase2}°C artış gözlemlenmiştir. Süt tankerlerinin beyaz olması da bu yüzdendir.</p>
            </div>
        `;
        
        // Şeffaf kap
        const transparent = experiment2.containers.find(c => c.color === 'Şeffaf');
        const increase3 = (transparent.targetTemp - transparent.startTemp).toFixed(1);
        html += `
            <div class="result-section">
                <h3>Orta Seviye – Şeffaf Kap</h3>
                <p>Şeffaf kap ışığın doğrudan suya ulaşmasına izin vermiştir. ${increase3}°C artışla orta seviyede ısınma gerçekleşmiştir. Seraların camdan yapılmasının sebebi budur.</p>
            </div>
        `;
    }
    
    content.innerHTML = html;
    modal.classList.add('active');
}

function closeResultsModal() {
    document.getElementById('results-modal').classList.remove('active');
}

// Modal dışına tıklandığında kapat
document.getElementById('results-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeResultsModal();
    }
});

// ==========================================
// SAYFA YÜKLENME
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    experiment1.init();
    experiment2.init();
});