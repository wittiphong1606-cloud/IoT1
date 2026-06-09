document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');

    // เพิ่มเอฟเฟกต์การกดปุ่ม (Micro-animation) [20]
    loginBtn.addEventListener('mousedown', () => {
        loginBtn.style.transform = 'scale(0.98)';
    });

    loginBtn.addEventListener('mouseup', () => {
        loginBtn.style.transform = 'translateY(-1px)';
    });

    // Heuristic #5: ตรวจสอบข้อมูลเบื้องต้นก่อนส่ง (Error Prevention) [9]
    loginForm.addEventListener('submit', (e) => {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (!user || !pass) {
            e.preventDefault();
            alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        } else {
            loginBtn.innerText = 'กำลังตรวจสอบ...';
            loginBtn.style.opacity = '0.7';
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // Micro-interactions สำหรับปุ่ม (Heuristic #1: Feedback) [6]
    const buttons = [document.getElementById('btnExport'), document.getElementById('btnSettings')];
    
    buttons.forEach(btn => {
        if(btn) {
            btn.addEventListener('click', () => {
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 100);
                console.log(`Action: ${btn.innerText} clicked`);
            });
        }
    });

    // จำลองการโหลดข้อมูล Gauge (Visual Feedback)
    console.log("Dashboard initialized for user performance tracking.");
});
// ════════════════════════════════════════
// Dashboard Scripts
// ════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // ── Toast helper ──
    function showToast(msg) {
        const t = document.getElementById('toast');
        if (!t) return;
        document.getElementById('toastMsg').textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    // ── Export Button ──
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            btnExport.innerHTML = '<i class="ti ti-loader"></i> กำลังส่งออก...';
            btnExport.disabled = true;
            setTimeout(() => {
                btnExport.innerHTML = '<i class="ti ti-download"></i> Export รายงาน';
                btnExport.disabled = false;
                showToast('ส่งออกรายงานสำเร็จแล้ว');
            }, 1500);
        });
    }

    // ── Settings Button ──
    const btnSettings = document.getElementById('btnSettings');
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            showToast('เปิดหน้าตั้งค่าระบบ...');
            setTimeout(() => {
                window.location.href = 'settings.php';
            }, 800);
        });
    }

    // ── Micro-interaction: scale on click ──
    [btnExport, btnSettings].forEach(btn => {
        if (btn) {
            btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.97)'; });
            btn.addEventListener('mouseup',   () => { btn.style.transform = 'scale(1)'; });
        }
    });

    console.log('Dashboard initialized for user performance tracking.');
});

// ════════════════════════════════════════
// Dashboard2 — Smart Farm Scripts
// ════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

    // ── Toast ──
    function sfToast(msg, color) {
        const t = document.getElementById('sf-toast');
        if (!t) return;
        t.querySelector('#sf-toastMsg').textContent = msg;
        t.style.background = color || '#0d9488';
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    // ── Sidebar nav active state ──
    document.querySelectorAll('.sf-nav-item[data-plot]').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sf-nav-item[data-plot]').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const plot = item.dataset.plot;
            const titleEl = document.getElementById('sf-plot-title');
            const subEl   = document.getElementById('sf-plot-sub');
            const cropEl  = document.getElementById('sf-crop-name');
            const plots = {
                '1': { title: 'แปลงที่ 1 — ข้าวหอมมะลิ', sub: 'อัปเดตล่าสุด: 26 พ.ค. 2026 · 08:30', crop: 'ข้าวหอมมะลิ · แปลง A-01' },
                '2': { title: 'แปลงที่ 2 — ข้าวโพดหวาน', sub: 'อัปเดตล่าสุด: 26 พ.ค. 2026 · 08:32', crop: 'ข้าวโพดหวาน · แปลง B-02' },
                '3': { title: 'แปลงที่ 3 — มะเขือเทศ',   sub: 'อัปเดตล่าสุด: 26 พ.ค. 2026 · 08:35', crop: 'มะเขือเทศ · แปลง C-03' },
                '4': { title: 'แปลงที่ 4 — ผักบุ้ง',     sub: 'อัปเดตล่าสุด: 26 พ.ค. 2026 · 08:40', crop: 'ผักบุ้ง · แปลง D-04' },
            };
            if (titleEl) titleEl.textContent = plots[plot].title;
            if (subEl)   subEl.textContent   = plots[plot].sub;
            if (cropEl)  cropEl.textContent  = plots[plot].crop;
            sfToast('โหลดข้อมูล' + item.querySelector('.sf-nav-text').textContent + 'แล้ว');
        });
    });

    // ── Export button ──
    const btnEx = document.getElementById('sf-btnExport');
    if (btnEx) {
        btnEx.addEventListener('click', () => {
            btnEx.innerHTML = '<i class="ti ti-loader"></i> กำลังส่งออก...';
            btnEx.disabled = true;
            setTimeout(() => {
                btnEx.innerHTML = '<i class="ti ti-download"></i> Export รายงาน';
                btnEx.disabled = false;
                sfToast('ส่งออกรายงานสำเร็จแล้ว ✓');
            }, 1500);
        });
    }

    // ── Irrigation button ──
    const btnIrr = document.getElementById('sf-btnIrrigate');
    if (btnIrr) {
        btnIrr.addEventListener('click', () => {
            btnIrr.innerHTML = '<i class="ti ti-loader"></i> กำลังเปิดวาล์ว...';
            btnIrr.disabled = true;
            setTimeout(() => {
                btnIrr.innerHTML = '<i class="ti ti-droplet"></i> สั่งรดน้ำ';
                btnIrr.disabled = false;
                sfToast('สั่งระบบรดน้ำสำเร็จแล้ว 💧');
            }, 1800);
        });
    }

    // ── Logout ──
    const btnLogout = document.getElementById('sf-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sfToast('กำลังออกจากระบบ...', '#dc2626');
            setTimeout(() => { window.location.href = 'login.php'; }, 1000);
        });
    }

    // ── Micro-interaction on all sf buttons ──
    document.querySelectorAll('.sf-btn-primary, .sf-btn-secondary').forEach(btn => {
        btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.97)'; });
        btn.addEventListener('mouseup',   () => { btn.style.transform = 'scale(1)'; });
    });

    console.log('Smart Farm Dashboard v2 initialized.');
});