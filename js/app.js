/* ===========================
   主入口 app.js - V2 (含登录/权限)
   全局状态、菜单切换、通用工具、路由守卫
   =========================== */

// ======== 全局时间 ========
function updateTime() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const t = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const el = document.getElementById('currentTime');
    if (el) el.textContent = t;
}
setInterval(updateTime, 1000);
updateTime();

// ======== 通用工具 ========
window.T = {
    pad: n => String(n).padStart(2, '0'),
    nowStr() {
        const d = new Date();
        return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(d.getSeconds())}`;
    },
    nowFull() {
        const d = new Date();
        return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())} ${this.nowStr()}`;
    },
    rand(min, max) { return Math.random() * (max - min) + min; },
    randInt(min, max) { return Math.floor(this.rand(min, max + 1)); },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    animateNum(id, target, duration = 1200) {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (!el) return;
        const start = 0;
        const startTime = performance.now();
        function step(now) {
            const p = Math.min((now - startTime) / duration, 1);
            const v = Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3)));
            el.textContent = v.toLocaleString();
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
    }
};

// ======== 全局日志 (跨页面共享) ========
window.GlobalLogs = [];
window.pushLog = function(module, level, msg) {
    const entry = { ts: T.nowFull(), md: module, lv: level, msg };
    window.GlobalLogs.push(entry);
    if (window.GlobalLogs.length > 2000) window.GlobalLogs.shift();
    return entry;
};
function addDashLog(level, msg) {
    const box = document.getElementById('dashLogBox');
    if (!box) return;
    const line = document.createElement('div');
    line.className = 'log-line ' + level;
    line.innerHTML = `<span class="t">${T.nowStr()}</span><span class="l">[${level}]</span><span class="m">${msg}</span>`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    while (box.children.length > 100) box.removeChild(box.firstChild);
}

// ======== 初始化种子日志 ========
for (let i = 0; i < 12; i++) {
    const modules = ['PLAT', 'DEV', 'ALG', 'CHIP'];
    const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'SUCCESS', 'DEBUG'];
    const samples = [
        '边缘设备 EDGE-0023 心跳正常，延迟 12ms',
        'AI模型 异常检测v2.1 推理完成，耗时 42ms',
        '自适应集成算法 新增协议匹配 MQTT→Json 成功',
        '预处理芯片 8号通道SNR提升至48.2dB',
        '接入新设备 海康DS-2CD3T 端口:554',
        '用户 管理员 登录成功 来自 192.168.1.100',
        '化工园区1号盒子 CPU使用率 43%，温度 51℃',
        '数据转换完成 样本数 2048 条',
        '部署人脸识别模型至 EDGE-0018 成功',
        '压力通道 THD 检测结果：0.2%（正常）',
        '数据库查询成功，返回 527 条设备记录',
        'MQTT Broker 连接稳定，订阅主题 128 个'
    ];
    pushLog(T.pick(modules), T.pick(levels), T.pick(samples));
}
setInterval(() => {
    const modules = ['PLAT', 'DEV', 'ALG', 'CHIP'];
    const levels = ['INFO', 'INFO', 'SUCCESS', 'WARN'];
    const msgs = [
        `盒子 EDGE-${T.randInt(10,99)} 心跳包已接收，信号强度 ${T.randInt(65,99)}%`,
        `[专利1算法] 完成一次协议自动匹配，类型: ${T.pick(['MQTT','Modbus','OPC-UA','RS485'])}`,
        `[专利2芯片] 完成 ${T.randInt(100,999)} 条数据预处理，SNR提升 ${T.rand(20,35).toFixed(1)}dB`,
        `AI模型推理执行: ${T.pick(['烟火识别','人脸识别','异常振动','能耗预测'])}，置信度 ${T.rand(85,99).toFixed(1)}%`,
        `平台API调用完成 编号:${T.randInt(10000,99999)} 耗时:${T.randInt(5,120)}ms`,
        `设备告警已恢复: ${T.pick(['温度异常','网络波动','电流过载'])}`,
    ];
    const entry = pushLog(T.pick(modules), T.pick(levels), T.pick(msgs));
    addDashLog(entry.lv, `[${entry.md}] ${entry.msg}`);
}, 4000);
window.addEventListener('load', () => {
    window.GlobalLogs.slice(-15).forEach(e => addDashLog(e.lv, `[${e.md}] ${e.msg}`));
});

// ======== 菜单切换 + 路由守卫 ========
function applyMenuPermission() {
    const me = Auth.currentUser();
    document.querySelectorAll('.menu-item[data-page]').forEach(mi => {
        const pg = mi.dataset.page;
        const permPg = mi.getAttribute('data-perm-page');
        const checkPage = permPg || pg;
        const canAccess = me && Auth.canAccessPage(checkPage);
        // users页初始隐藏(style=display:none)，有权限时才显示
        if (checkPage === 'users') {
            mi.style.display = canAccess ? 'flex' : 'none';
        } else {
            mi.style.display = me ? 'flex' : 'flex'; // 始终显示，跳转时会校验
        }
    });
    // 用户下拉菜单中的"用户与权限"行
    document.querySelectorAll('.ud-row[data-perm-page]').forEach(r => {
        const canAccess = me && Auth.canAccessPage(r.getAttribute('data-perm-page'));
        r.style.display = canAccess ? 'flex' : 'none';
    });
}

document.querySelectorAll('.menu-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
        const pg = item.dataset.page;
        const me = Auth.currentUser();

        // 路由守卫：未登录 → 登录页
        if (!me) {
            showLogin();
            return;
        }
        // 权限守卫：无权 → 提示
        if (!Auth.canAccessPage(pg)) {
            const roleMeta = Auth.ROLES[me.role] || {};
            document.getElementById('permDeniedMsg').innerHTML =
                `当前角色: <b style="color:${roleMeta.color}">${roleMeta.label}</b><br/>无权访问 <b style="color:#fff">${item.querySelector('.menu-text').textContent}</b><br/>请联系超级管理员升级角色权限`;
            document.getElementById('permDenied').style.display = 'flex';
            return;
        }
        // 切换
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        const target = document.getElementById('page-' + pg);
        if (target) target.classList.add('active');
        if (typeof window['init_' + pg] === 'function') window['init_' + pg]();
    });
});

// ======== 当前用户渲染 ========
function renderCurrentUser() {
    const me = Auth.currentUser();
    const nicknameEl = document.getElementById('userNickname');
    const avatarEl = document.getElementById('userAvatar');
    const roleWrap = document.getElementById('userRoleWrap');
    const rolePill = document.getElementById('userRolePill');

    if (!me) {
        nicknameEl.textContent = '未登录';
        avatarEl.textContent = '?';
        roleWrap.style.display = 'none';
        return;
    }
    nicknameEl.textContent = me.nickname;
    avatarEl.textContent = me.nickname ? me.nickname.charAt(0) : '?';
    const roleMeta = Auth.ROLES[me.role] || {};
    rolePill.textContent = roleMeta.label || me.role;
    rolePill.style.background = (roleMeta.color || '#999') + '22';
    rolePill.style.color = roleMeta.color || '#999';
    rolePill.style.border = `1px solid ${roleMeta.color || '#999'}55`;
    roleWrap.style.display = 'inline-flex';

    // 下拉头像
    const udA = document.getElementById('udAvatar');
    udA.textContent = me.nickname ? me.nickname.charAt(0) : '?';
    udA.style.background = `linear-gradient(135deg, ${roleMeta.color}aa, ${roleMeta.color}44)`;
    document.getElementById('udNickname').textContent = me.nickname;
    document.getElementById('udUsername').textContent = '@' + me.username;
}

// ======== 用户下拉菜单 ========
function toggleUserMenu(ev) {
    ev.stopPropagation();
    const me = Auth.currentUser();
    if (!me) { showLogin(); return; }
    const drp = document.getElementById('userDropdown');
    drp.style.display = (drp.style.display === 'none' || !drp.style.display) ? 'block' : 'none';
}
window.toggleUserMenu = toggleUserMenu;
document.addEventListener('click', () => {
    const d = document.getElementById('userDropdown');
    if (d) d.style.display = 'none';
});
// 点击 "用户与权限管理" 行
document.addEventListener('click', (ev) => {
    const r = ev.target.closest('.ud-row[data-perm-page]');
    if (!r) return;
    const pg = r.getAttribute('data-perm-page');
    document.getElementById('userDropdown').style.display = 'none';
    const mi = document.querySelector(`.menu-item[data-page="${pg}"]`);
    if (mi) mi.click();
});

// ======== 登录/登出 ========
window.currentCaptcha = '';
function refreshCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let s = '';
    for (let i = 0; i < 4; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    window.currentCaptcha = s;
    const box = document.getElementById('captchaBox');
    if (box) {
        box.textContent = s;
        box.style.background = `hsl(${Math.floor(Math.random()*360)},50%,25%)`;
    }
}
window.refreshCaptcha = refreshCaptcha;

function fillAccount(u, p) {
    document.getElementById('lg_username').value = u;
    document.getElementById('lg_password').value = p;
}
window.fillAccount = fillAccount;

function showLogin() {
    document.getElementById('loginMask').style.display = 'flex';
    refreshCaptcha();
    document.getElementById('lg_password').value = '';
    document.getElementById('lg_captcha').value = '';
    document.getElementById('loginTip').style.display = 'none';
}
window.showLogin = showLogin;

async function doLogin() {
    const u = document.getElementById('lg_username').value.trim();
    const p = document.getElementById('lg_password').value;
    const cap = document.getElementById('lg_captcha').value.trim();
    const btn = document.getElementById('loginBtn');
    const tip = document.getElementById('loginTip');

    if (!u || !p) { showLoginTip('请输入用户名和密码', 'err'); return; }
    if (!cap) { showLoginTip('请输入验证码', 'err'); return; }
    if (cap.toLowerCase() !== (window.currentCaptcha || '').toLowerCase()) {
        showLoginTip('验证码错误，已刷新', 'err');
        document.getElementById('lg_captcha').value = '';
        refreshCaptcha();
        return;
    }
    btn.disabled = true;
    document.getElementById('loginBtnText').textContent = '登录中...';
    await new Promise(r => setTimeout(r, 400));
    const res = await Auth.login(u, p);
    btn.disabled = false;
    document.getElementById('loginBtnText').textContent = '登 录';

    if (res.ok) {
        cachedUser = null; // 清空app级缓存
        showLoginTip('登录成功，正在进入系统...', 'ok');
        setTimeout(() => {
            document.getElementById('loginMask').style.display = 'none';
            afterLogin();
        }, 500);
    } else {
        showLoginTip(res.msg || '登录失败', 'err');
        document.getElementById('lg_password').value = '';
        refreshCaptcha();
        document.getElementById('lg_captcha').value = '';
    }
}
window.doLogin = doLogin;

function showLoginTip(msg, type) {
    const tip = document.getElementById('loginTip');
    tip.textContent = msg;
    tip.style.display = 'block';
    tip.className = 'login-tip ' + (type === 'ok' ? 'ok' : 'err');
}

function doLogout() {
    if (!confirm('确认退出登录？')) return;
    document.getElementById('userDropdown').style.display = 'none';
    Auth.logout();
    renderCurrentUser();
    applyMenuPermission();
    // 停在默认页并展示登录
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.menu-item[data-page="dashboard"]')[0].classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-dashboard').classList.add('active');
    showLogin();
}
window.doLogout = doLogout;

// ======== 登录后初始化流程 ========
function afterLogin() {
    renderCurrentUser();
    applyMenuPermission();
    // 按钮级权限初始化
    applyButtonPermission();
    // 初始化驾驶舱
    if (typeof init_dashboard === 'function') init_dashboard();
}

// ======== 按钮级权限控制 (作用于全局) ========
function applyButtonPermission() {
    const map = [
        { sel: '#page-devices .btn[onclick="addMockDevice()"]', act: 'DEVICE_ADD' },
        { sel: '#page-integration .btn[onclick="runIntegrationDemo()"]', act: 'INTEGRATION_RUN' },
        { sel: '#page-logs .btn[onclick="clearLogs()"]', act: 'LOG_CLEAR' },
    ];
    map.forEach(({ sel, act }) => {
        const els = document.querySelectorAll(sel);
        els.forEach(el => {
            const orig = el.dataset.origDisplay || (el.offsetParent ? '' : 'inline-block');
            if (el.dataset.origDisplay === undefined) el.dataset.origDisplay = el.style.display;
            el.style.display = Auth.canDoAction(act) ? (el.dataset.origDisplay || '') : 'none';
            if (!Auth.canDoAction(act)) {
                el.style.display = 'none';
            }
        });
    });
}

// ======== 用户页过滤器(简单路由) ========
window.filterUsers = function() {
    // 每次筛选都重渲染 + 前端过滤（通过临时操作数据实现）
    renderUserList();
    const kw = (document.getElementById('userSearch').value || '').toLowerCase();
    const rf = document.getElementById('userRoleFilter').value;
    const sf = document.getElementById('userStatusFilter').value;
    const body = document.getElementById('userTableBody');
    if (!body) return;
    [...body.querySelectorAll('tr')].forEach(tr => {
        const txt = tr.innerText.toLowerCase();
        const matchKw = !kw || txt.includes(kw);
        const matchR = !rf || tr.innerHTML.includes(`role-pill`);
        let ok = matchKw;
        if (rf) {
            const label = Auth.ROLES[rf] ? Auth.ROLES[rf].label : rf;
            ok = ok && tr.innerHTML.includes(label);
        }
        if (sf === '1') ok = ok && tr.innerHTML.includes('status-pill success');
        if (sf === '0') ok = ok && tr.innerHTML.includes('status-pill warning');
        tr.style.display = ok ? '' : 'none';
    });
};

// ======== 页面启动 ========
Promise.resolve(window._authReady || (Auth && Auth.initUsers && Auth.initUsers()))
    .then(async () => {
        // 生成验证码
        refreshCaptcha();

        const user = await Auth.currentUserAsync();
        if (user) {
            // 已登录：跳过锁屏
            document.getElementById('loginMask').style.display = 'none';
            afterLogin();
        } else {
            // 未登录：展示登录
            showLogin();
        }
    });
