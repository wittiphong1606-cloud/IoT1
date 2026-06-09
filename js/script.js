const TOKEN = "vScIoYvwREkcrw5V58GMHJWVxBRArthV";
const BASE_URL = "https://blynk.cloud/external/api/";

// 1. ฟังก์ชันส่งค่าไปยัง Blynk (ปุ่ม V0, สไลเดอร์ V2)
async function updatePin(pin, value) {
    try {
        const url = `${BASE_URL}update?token=${TOKEN}&${pin}=${value}`;
        await fetch(url);
        console.log(`Update ${pin} to ${value} success`);
    } catch (error) {
        console.error("API Error:", error);
    }
}

function updateButton(state) {
    const val = state ? 1 : 0;
    document.getElementById('btnStatus').innerText = `สถานะ: ${state ? 'ON' : 'OFF'}`;
    updatePin('V0', val);
}

function updateSlider(val) {
    document.getElementById('sliderVal').innerText = val;
    updatePin('V2', val);
}

// 2. ฟังก์ชันดึงค่าจาก Blynk (LED V1, Gauge V3, Label V4)
async function fetchStatus() {
    try {
        // ดึงค่าหลาย Pin ในครั้งเดียว (Blynk HTTP API รองรับการ get ทีละ Pin หรือดึงทั้งหมด)
        // เพื่อความเรียบง่าย จะดึงค่าทีละจุดเพื่ออัปเดต UI
        
        // อ่านค่า V1 (LED)
        const v1Res = await fetch(`${BASE_URL}get?token=${TOKEN}&V1`);
        const v1Val = await v1Res.text();
        updateLED(v1Val);

        // อ่านค่า V3 (Gauge)
        const v3Res = await fetch(`${BASE_URL}get?token=${TOKEN}&V3`);
        const v3Val = await v3Res.text();
        updateGauge(v3Val);

        // อ่านค่า V4 (Label)
        const v4Res = await fetch(`${BASE_URL}get?token=${TOKEN}&V4`);
        const v4Val = await v4Res.text();
        document.getElementById('responseLabel').innerText = v4Val;

    } catch (error) {
        console.log("Polling error:", error);
    }
}

function updateLED(val) {
    const led = document.getElementById('ledIndicator');
    if (val == "1") {
        led.classList.add('led-on');
        document.getElementById('ledText').innerText = "ระบบกำลังทำงาน";
    } else {
        led.classList.remove('led-on');
        document.getElementById('ledText').innerText = "ระบบหยุดนิ่ง";
    }
}

function updateGauge(val) {
    const percentage = Math.min(Math.max(val, 0), 100);
    const offset = 283 - (283 * percentage / 100);
    document.getElementById('gaugeProgress').style.strokeDashoffset = offset;
    document.getElementById('gaugeVal').innerText = `${percentage}°C`;
}
// เริ่มต้นดึงข้อมูลทุกๆ 2 วินาที (Polling) เพื่อความ Real-time [10]
setInterval(fetchStatus, 2000);
window.onload = fetchStatus;