/* ===========================
   主入口 app.js
   全局状态、菜单切换、通用工具
   =========================== */

// 全局时间
function updateTime() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const t = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    document.getElementById('currentTime').textContent = t;
}
setInterval(updateTime, 1000);
updateTime();

// 菜单切换
document.querySelectorAll('.menu-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
        const pg = item.dataset.page;
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        const target = document.getElementById('page-' + pg);
        if (target) target.classList.add('active');
        // 页面初始化回调
        if (typeof window['init_' + pg] === 'function') window['init_' + pg]();
    });
});

// 通用工具
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
    // 数字动画
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

// 全局日志（跨页面共享）
window.GlobalLogs = [];
window.pushLog = function(module, level, msg) {
    const entry = { ts: T.nowFull(), md: module, lv: level, msg };
    window.GlobalLogs.push(entry);
    if (window.GlobalLogs.length > 2000) window.GlobalLogs.shift();
    return entry;
};

// 模拟日志输出到dash日志框
function addDashLog(level, msg) {
    const box = document.getElementById('dashLogBox');
    if (!box) return;
    const line = document.createElement('div');
    line.className = 'log-line ' + level;
    line.innerHTML = `<span class="t">${T.nowStr()}</span><span class="l">[${level}]</span><span class="m">${msg}</span>`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    // 限制最多100条
    while (box.children.length > 100) box.removeChild(box.firstChild);
}

// 生成初始日志
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

// 每5秒追加一条新日志
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
    // 同步至驾驶舱日志
    addDashLog(entry.lv, `[${entry.md}] ${entry.msg}`);
}, 4000);

// 首次加载页面
window.addEventListener('load', () => {
    // 生成dash初始日志
    window.GlobalLogs.slice(-15).forEach(e => addDashLog(e.lv, `[${e.md}] ${e.msg}`));
});
