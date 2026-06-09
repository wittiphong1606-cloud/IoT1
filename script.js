// ========================================
// SmartHomeWittip - Virtual IoT Dashboard
// Blynk Cloud HTTPS API Controller
// ========================================

const TOKEN = "55qExuym9mXCdbhgMa5yvnyBukFpcxIx";
const BASE_URL = "https://blynk.cloud/external/api/";

let tempChart;
const maxDataPoints = 20;
let isConnected = false;
let consecutiveErrors = 0;
const MAX_ERRORS_BEFORE_DISCONNECT = 3;

// --- 1. Chart Initialization ---

function initChart() {
    const ctx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#0d9488',
                backgroundColor: 'rgba(13, 148, 136, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#0d9488',
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 600, easing: 'easeOutQuart' },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { family: 'Inter' } }
                },
                x: {
                    display: false
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { family: 'Inter' },
                    bodyFont: { family: 'Inter' },
                    padding: 12,
                    cornerRadius: 12
                }
            }
        }
    });
}

// --- 2. Connection Status ---

function setConnectionStatus(connected, message) {
    const badge = document.getElementById('cloudStatus');
    const dot = document.getElementById('statusDot');

    if (connected) {
        isConnected = true;
        consecutiveErrors = 0;
        badge.className = 'system-badge connected';
        badge.innerHTML = `<span class="status-dot online" id="statusDot"></span> Cloud Connected`;
    } else {
        isConnected = false;
        badge.className = 'system-badge disconnected';
        badge.innerHTML = `<span class="status-dot offline" id="statusDot"></span> ${message || 'Disconnected'}`;
    }
}

// --- 3. Control Functions (Send to Blynk) ---

async function updatePin(pin, value) {
    try {
        const url = `${BASE_URL}update?token=${TOKEN}&${pin}=${value}`;
        const res = await fetch(url);
        if (res.ok) {
            console.log(`✅ Update ${pin} → ${value}`);
            setConnectionStatus(true);
        } else {
            console.warn(`⚠️ Update ${pin} failed: HTTP ${res.status}`);
        }
    } catch (error) {
        console.error("❌ API Error:", error);
        setConnectionStatus(false, 'Send Failed');
    }
}

function updateButton(pin, state) {
    const val = state ? 1 : 0;
    console.log(`🔘 Switch ${pin}: ${state ? 'ON' : 'OFF'}`);
    updatePin(pin, val);
}

function updateSlider(val) {
    document.getElementById('dim-val').innerText = val;
    // Update brightness icon opacity based on slider value
    const brightness = Math.max(0.2, val / 255);
    const icon = document.getElementById('brightness-icon');
    if (icon) icon.style.opacity = brightness;
    updatePin('V5', val);
}

// --- 4. Send Message to V6 ---

async function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    // Update UI immediately
    const msgEl = document.getElementById('msg-v6');
    msgEl.innerText = text;
    msgEl.classList.remove('msg-waiting');

    // Send to Blynk V6
    try {
        const url = `${BASE_URL}update?token=${TOKEN}&V6=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (res.ok) {
            console.log(`✅ Message sent: "${text}"`);
            input.value = '';
            setConnectionStatus(true);
        } else {
            console.warn('⚠️ Message send failed');
        }
    } catch (error) {
        console.error('❌ Send error:', error);
        setConnectionStatus(false, 'Send Failed');
    }
}

// --- 5. Dark Mode Toggle ---

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    const btn = document.getElementById('darkModeBtn');
    btn.innerText = isDark ? '☀️' : '🌙';

    // Update chart colors for dark mode
    if (tempChart) {
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        tempChart.options.scales.y.grid.color = gridColor;
        tempChart.update('none');
    }
}

// --- 5. Polling / Fetch Status ---

async function fetchSinglePin(pin) {
    try {
        const res = await fetch(`${BASE_URL}get?token=${TOKEN}&${pin}`);

        if (!res.ok) {
            // Pin has no value yet or other API error — this is normal for unused pins
            return null;
        }

        const val = await res.text();

        // Check if response is a JSON error object
        try {
            const jsonObj = JSON.parse(val);
            if (jsonObj && jsonObj.error) {
                return null;
            }
        } catch (e) {
            // Not JSON = normal value, continue
        }

        return val;
    } catch (error) {
        throw error; // Re-throw network errors
    }
}

async function fetchStatus() {
    try {
        // First, do a quick connectivity check with V4 (we know it has a value)
        const pinsToGet = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'];
        let anySuccess = false;

        for (const pin of pinsToGet) {
            const val = await fetchSinglePin(pin);

            if (val === null) {
                // Pin has no value — skip but don't count as error
                continue;
            }

            anySuccess = true;

            // Route value to the correct UI handler
            switch (pin) {
                case 'V0':
                case 'V1':
                case 'V2':
                    const checkbox = document.getElementById(pin.toLowerCase());
                    if (checkbox) checkbox.checked = (val === "1");
                    break;
                case 'V3':
                    updateLED(val);
                    break;
                case 'V4':
                    updateGauge(val);
                    break;
                case 'V5':
                    updateSliderUI(val);
                    break;
                case 'V6':
                    updateSystemMessage(val);
                    break;
                case 'V7':
                    updateHumidity(val);
                    break;
            }
        }

        // If at least one pin returned data, we're connected
        if (anySuccess) {
            setConnectionStatus(true);
        } else {
            consecutiveErrors++;
            if (consecutiveErrors >= MAX_ERRORS_BEFORE_DISCONNECT) {
                setConnectionStatus(false, 'No Data from Blynk');
            }
        }

    } catch (error) {
        console.error("❌ Polling error:", error);
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_ERRORS_BEFORE_DISCONNECT) {
            setConnectionStatus(false, 'Connection Lost');
        }
    }
}

// --- 6. UI Update Functions ---

function updateLED(val) {
    const led = document.getElementById('led-v3');
    const text = document.getElementById('led-text');
    if (val === "1") {
        led.classList.add('led-on');
        text.innerText = "ระบบกำลังทำงาน";
    } else {
        led.classList.remove('led-on');
        text.innerText = "ระบบหยุดนิ่ง";
    }
}

function updateGauge(val) {
    const numVal = parseFloat(val);
    const percentage = Math.min(Math.max(numVal, 0), 100);
    const offset = 283 - (283 * percentage / 100);
    document.getElementById('gauge-v4').style.strokeDashoffset = offset;
    document.getElementById('temp-val').innerText = `${percentage.toFixed(1)}°C`;

    // Update chart
    if (tempChart) {
        const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        tempChart.data.labels.push(now);
        tempChart.data.datasets[0].data.push(numVal);
        if (tempChart.data.labels.length > maxDataPoints) {
            tempChart.data.labels.shift();
            tempChart.data.datasets[0].data.shift();
        }
        tempChart.update('none');
    }
}

function updateSliderUI(val) {
    const slider = document.getElementById('v5');
    const display = document.getElementById('dim-val');
    if (slider && display) {
        slider.value = val;
        display.innerText = val;
    }
}

function updateSystemMessage(val) {
    const msgEl = document.getElementById('msg-v6');
    if (msgEl && val && val.trim() !== '') {
        msgEl.innerText = val;
        msgEl.classList.remove('msg-waiting');
    }
}

function updateHumidity(val) {
    const numVal = parseFloat(val);
    document.getElementById('humi-text').innerText = `${numVal.toFixed(1)}%`;
    document.getElementById('humi-bar').style.width = `${numVal}%`;
}

// --- 7. Initialization ---

window.onload = () => {
    // Restore dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('darkModeBtn');
        if (btn) btn.innerText = '☀️';
    }

    initChart();
    setConnectionStatus(false, 'Connecting...');

    // Enter key to send message
    const msgInput = document.getElementById('msg-input');
    if (msgInput) {
        msgInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // First fetch immediately
    fetchStatus();

    // Then poll every 2 seconds
    setInterval(fetchStatus, 2000);
};
