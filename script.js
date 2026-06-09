const TOKEN = "55qExuym9mXCdbhgMa5yvnyBukFpcxIx";
const BASE_URL = "https://blynk.cloud/external/api/";

let tempChart;
const maxDataPoints = 20;

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
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false }, x: { display: false } },
            plugins: { legend: { display: false } }
        }
    });
}

// --- 2. ฟังก์ชันการส่งค่า (Control) ---

// ฟังก์ชันหลักในการส่งคำสั่ง (เหมือน updatePin ในตัวอย่างของคุณ)
async function updatePin(pin, value) {
    try {
        const url = `${BASE_URL}update?token=${TOKEN}&${pin}=${value}`;
        await fetch(url);
        console.log(`Update ${pin} to ${value} success`);
    } catch (error) {
        console.error("API Error:", error);
    }
}

// สำหรับ Switch V0, V1, V2
function updateButton(pin, state) {
    const val = state ? 1 : 0;
    // ปรับปรุง UI ทันที (Visibility of System Status [1])
    console.log(`สถานะ ${pin}: ${state ? 'ON' : 'OFF'}`);
    updatePin(pin, val);
}

// สำหรับ Slider V5
function updateSlider(val) {
    document.getElementById('dim-val').innerText = val;
    updatePin('V5', val);
}

// --- 3. ฟังก์ชันการดึงค่า (Polling/Display) ---

// ฟังก์ชันดึงค่าจาก Blynk (เหมือน fetchStatus ในตัวอย่างของคุณ)
async function fetchStatus() {
    try {
        // ดึงค่าสถานะสวิตช์ (V0-V2) เพื่อให้ UI ตรงกับ Cloud
        const pinsToGet = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'];
        
        for (let pin of pinsToGet) {
            const res = await fetch(`${BASE_URL}get?token=${TOKEN}&${pin}`);
            const val = await res.text();

            // แยกจัดการแต่ละ Pin ตามตรรกะที่ต้องการ
            if (pin === 'V3') updateLED(val);
            if (pin === 'V4') updateGauge(val);
            if (pin === 'V6') document.getElementById('msg-v6').innerText = val;
            if (pin === 'V7') updateHumidity(val);
            if (pin === 'V0' || pin === 'V1' || pin === 'V2') {
                document.getElementById(pin.toLowerCase()).checked = (val == "1");
            }
        }
    } catch (error) {
        console.log("Polling error:", error);
    }
}

// ฟังก์ชันอัปเดต LED V3 (ตามตรรกะที่คุณต้องการ [2, 3])
function updateLED(val) {
    const led = document.getElementById('led-v3');
    if (val == "1") {
        led.classList.add('led-on');
        document.getElementById('led-text').innerText = "ระบบกำลังทำงาน";
    } else {
        led.classList.remove('led-on');
        document.getElementById('led-text').innerText = "ระบบหยุดนิ่ง";
    }
}

// ฟังก์ชันอัปเดต Gauge V4 (อุณหภูมิ) และอัปเดตกราฟ [4]
function updateGauge(val) {
    const percentage = Math.min(Math.max(val, 0), 100);
    const offset = 283 - (283 * percentage / 100);
    document.getElementById('gauge-v4').style.strokeDashoffset = offset;
    document.getElementById('temp-val').innerText = `${percentage}°C`;
    
    // อัปเดตข้อมูลกราฟ Real-time
    if (tempChart) {
        const now = new Date().toLocaleTimeString();
        tempChart.data.labels.push(now);
        tempChart.data.datasets.data.push(val);
        if (tempChart.data.labels.length > maxDataPoints) {
            tempChart.data.labels.shift();
            tempChart.data.datasets.data.shift();
        }
        tempChart.update('none');
    }
}

// ฟังก์ชันเสริมสำหรับ V7 (ความชื้น)
function updateHumidity(val) {
    document.getElementById('humi-text').innerText = `${val}%`;
    document.getElementById('humi-bar').style.width = `${val}%`;
}

// เริ่มต้นดึงข้อมูลทุกๆ 2 วินาที (Polling) เพื่อความ Real-time [5]
window.onload = () => {
    initChart();
    fetchStatus();
    setInterval(fetchStatus, 2000);
};