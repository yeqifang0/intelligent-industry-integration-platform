/* ===========================
   integration.js - 自适应集成中心
   =========================== */

// 现场设备池（对应方言输入）
const DevicePool = [
    { id: 'D1', icon: '📹', name: '海康摄像头 DS-2CD3T', proto: 'RTSP/ONVIF' },
    { id: 'D2', icon: '🌡️', name: 'PT100温度传感阵列', proto: 'Modbus RTU / RS485' },
    { id: 'D3', icon: '💨', name: '压力变送器 EJA530A', proto: '4-20mA / HART' },
    { id: 'D4', icon: '🤖', name: '发那科机械臂 R-2000iC', proto: 'TCP 私有协议' },
    { id: 'D5', icon: '📳', name: '三轴振动传感器', proto: 'IEPE / 0-5V' },
    { id: 'D6', icon: '⚡', name: '电流互感器 + 电能表', proto: 'Modbus TCP / IEC61850' },
    { id: 'D7', icon: '🧪', name: 'PH/ORP在线分析仪', proto: 'RS232 私有格式' },
    { id: 'D8', icon: '📷', name: '基恩士视觉CV-X系列', proto: 'EtherNet/IP 工业协议' },
    { id: 'D9', icon: '🏭', name: '西门子PLC S7-1200', proto: 'OPC-UA / S7Comm' },
    { id: 'D10', icon: '🌫️', name: 'VOC气体探测器', proto: 'Modbus RTU (自定义帧)' },
];

// AI应用池（对应普通话输出）
const AIPool = [
    { id: 'A1', icon: '🔥', name: '烟火识别算法', type: '计算机视觉 · 目标检测' },
    { id: 'A2', icon: '👤', name: '人脸识别与布控', type: '计算机视觉 · 识别' },
    { id: 'A3', icon: '⚠️', name: '设备异常振动检测', type: '时序信号 · 异常检测' },
    { id: 'A4', icon: '📈', name: '设备寿命预测维护', type: '时序 · 预测模型' },
    { id: 'A5', icon: '🔍', name: '工业视觉缺陷检测', type: '计算机视觉 · 分割' },
    { id: 'A6', icon: '💧', name: '能耗分析与优化', type: '多变量 · 回归模型' },
    { id: 'A7', icon: '☠️', name: '危化品泄漏预警', type: '多维信号 · 阈值+AI' },
    { id: 'A8', icon: '🧲', name: '焊缝质量智能评估', type: '视觉+电流特征融合' },
];

// 已完成集成
let Integrations = [
    { idx: 1, device: 'D1', ai: 'A1', status: 'success', last: '10秒前' },
    { idx: 2, device: 'D1', ai: 'A2', status: 'success', last: '23秒前' },
    { idx: 3, device: 'D2', ai: 'A4', status: 'success', last: '45秒前' },
    { idx: 4, device: 'D5', ai: 'A3', status: 'success', last: '1分钟前' },
    { idx: 5, device: 'D6', ai: 'A6', status: 'processing', last: '正在下发' },
    { idx: 6, device: 'D8', ai: 'A5', status: 'success', last: '3分钟前' },
];

let selectedDev = null;
let selectedAI = null;

window.init_integration = function() {
    renderDevicePool();
    renderAIPool();
    renderIntegrations();
};

function renderDevicePool() {
    const box = document.getElementById('deviceSourceList');
    if (!box) return;
    box.innerHTML = DevicePool.map(d => `
        <div class="device-card ${selectedDev===d.id?'selected':''}" onclick="selectDev('${d.id}')">
            <div class="name"><span class="icon">${d.icon}</span>${d.name}</div>
            <div class="proto">协议 <span class="dev-proto-tag">${d.proto}</span></div>
        </div>
    `).join('');
}

function renderAIPool() {
    const box = document.getElementById('aiTargetList');
    if (!box) return;
    box.innerHTML = AIPool.map(a => `
        <div class="ai-card ${selectedAI===a.id?'selected':''}" onclick="selectAI('${a.id}')">
            <div class="name"><span class="icon">${a.icon}</span>${a.name}</div>
            <div class="type">${a.type}</div>
        </div>
    `).join('');
}

function selectDev(id) { selectedDev = id; renderDevicePool(); checkRunAuto(); }
function selectAI(id) { selectedAI = id; renderAIPool(); checkRunAuto(); }
window.selectDev = selectDev; window.selectAI = selectAI;

function checkRunAuto() {
    if (selectedDev && selectedAI) {
        // 自动触发演示
        setTimeout(() => runIntegrationDemo(), 200);
    }
}

/* 演示算法全流程 */
let demoRunning = false;
async function runIntegrationDemo() {
    if (demoRunning) return;
    demoRunning = true;
    const dev = DevicePool.find(d => d.id === selectedDev) || T.pick(DevicePool);
    const ai = AIPool.find(a => a.id === selectedAI) || T.pick(AIPool);
    selectedDev = dev.id; selectedAI = ai.id;
    renderDevicePool(); renderAIPool();

    // 清空细节
    for (let i = 1; i <= 5; i++) {
        document.getElementById('step' + i + 'Detail').textContent = '等待输入...';
        document.querySelectorAll('.flow-step').forEach(s => s.classList.remove('running', 'done'));
    }
    clearAlgoLog();
    addAlgoLog('info', `▶ 开始自适应集成：【${dev.name}】 → 【${ai.name}】`);

    // Step 1
    const s1 = document.querySelector('.step-input');
    s1.classList.add('running');
    await sleep(450);
    const sampleBytes = Array.from({length:8}, () => T.randInt(0,255));
    document.getElementById('step1Detail').innerHTML = `
        <div>✅ 识别DeviceID: <b style="color:var(--primary)">${dev.id}-${T.randInt(1000,9999)}</b></div>
        <div>✅ 探测接口: <b style="color:var(--primary)">${dev.proto.split('/')[0].trim()}</b></div>
        <div>✅ 截取样本帧: ${sampleBytes.map(b => '0x'+b.toString(16).padStart(2,'0')).join(' ')}</div>
    `;
    addAlgoLog('success', `Step1 接入识别完成 | 接口: ${dev.proto}`);
    s1.classList.remove('running'); s1.classList.add('done');

    // Step 2
    const s2 = document.querySelectorAll('.step-process')[0];
    s2.classList.add('running');
    await sleep(500);
    const len = T.randInt(12, 64);
    const frame = T.randInt(0, 1) ? '存在帧头0xAA+帧尾0x55' : '基于时间分隔符';
    const freq = (T.rand(1, 100)).toFixed(1);
    document.getElementById('step2Detail').innerHTML = `
        <div>📐 帧结构: 长度≈<b style="color:var(--primary)">${len}B</b> · ${frame}</div>
        <div>⏱ 采样频率: <b style="color:var(--primary)">${freq} Hz</b> · 周期规律✓</div>
        <div>🔠 特征向量F: 42维指纹 已生成</div>
    `;
    addAlgoLog('success', `Step2 指纹提取完成 | 42维特征向量 | 采样率 ${freq}Hz`);
    s2.classList.remove('running'); s2.classList.add('done');

    // Step 3
    const s3 = document.querySelectorAll('.step-process')[1];
    s3.classList.add('running');
    await sleep(500);
    const candidates = [dev.proto.split('/')[0].trim(), 'Modbus RTU', '自定义私有协议'];
    const matched = candidates[0];
    const score = (T.rand(92, 99.5)).toFixed(1);
    document.getElementById('step3Detail').innerHTML = `
        <div>🔎 驱动库候选: ${candidates.length} 个</div>
        <div>🏆 最佳匹配: <b style="color:var(--success)">${matched}</b> (置信度 ${score}%)</div>
        <div>📚 命中驱动文件: driver_${matched.replace(/\s|[-\/]/g,'_')}.so</div>
    `;
    addAlgoLog('info', `Step3 协议匹配 | 候选${candidates.length}个 | 最佳: ${matched} ${score}%`);
    s3.classList.remove('running'); s3.classList.add('done');

    // Step 4
    const s4 = document.querySelectorAll('.step-process')[2];
    s4.classList.add('running');
    await sleep(500);
    document.getElementById('step4Detail').innerHTML = `
        <div>🔄 解码: Byte-Stream → 结构化字段 (×${T.randInt(6, 20)})</div>
        <div>📐 量纲: 原始值 → 物理单位 (温度/压力/电流)</div>
        <div>🧩 标准化: <b style="color:var(--primary)">JSON + Tensor</b> 双输出</div>
    `;
    addAlgoLog('success', `Step4 格式转换完成 | 方言 → 普通话 | 输出标准JSON+Tensor`);
    s4.classList.remove('running'); s4.classList.add('done');

    // Step 5
    const s5 = document.querySelector('.step-output');
    s5.classList.add('running');
    await sleep(500);
    const latency = T.randInt(18, 85);
    document.getElementById('step5Detail').innerHTML = `
        <div>🎯 模型: <b style="color:var(--success)">${ai.name}</b> 已加载</div>
        <div>📦 下发: MQTT topic = edge/${dev.id}/cmd</div>
        <div>⚡ 端到端延迟: <b style="color:var(--warning)">${latency} ms</b></div>
    `;
    addAlgoLog('success', `Step5 AI对接完成 | 模型[${ai.name}]已部署 | 延迟${latency}ms`);
    s5.classList.remove('running'); s5.classList.add('done');
    addAlgoLog('success', `✔ 自适应集成流程全部完成！ 设备[${dev.name}] ⇋ AI[${ai.name}] 已连通`);

    // 加入已完成列表
    Integrations.unshift({
        idx: Integrations.length + 1, device: dev.id, ai: ai.id,
        status: 'success', last: '刚刚完成'
    });
    renderIntegrations();

    pushLog('ALG', 'SUCCESS', `自适应集成完成: ${dev.name} → ${ai.name} 延迟${latency}ms`);
    selectedDev = null; selectedAI = null;
    setTimeout(() => { renderDevicePool(); renderAIPool(); demoRunning = false; }, 300);
}
window.runIntegrationDemo = runIntegrationDemo;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function addAlgoLog(level, msg) {
    const body = document.getElementById('algoLogBody');
    if (!body) return;
    const line = document.createElement('div');
    line.className = 'algo-log-line ' + level;
    line.innerHTML = `<span class="ts">${T.nowStr()}</span><span class="lv">[${level.toUpperCase()}]</span><span>${msg}</span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}
function clearAlgoLog() {
    const body = document.getElementById('algoLogBody');
    if (body) body.innerHTML = '';
}

function renderIntegrations() {
    document.getElementById('integrationCount').textContent = Integrations.length;
    const tb = document.getElementById('integrationTableBody');
    if (!tb) return;
    tb.innerHTML = Integrations.map(it => {
        const d = DevicePool.find(x => x.id === it.device);
        const a = AIPool.find(x => x.id === it.ai);
        const cls = it.status === 'success' ? 'success' : 'processing';
        const txt = it.status === 'success' ? '运行中' : '下发中';
        return `
            <tr>
                <td>${it.idx}</td>
                <td>${d?d.icon+' '+d.name:it.device}</td>
                <td><span class="dev-proto-tag">${d?d.proto.split('/')[0]:'-'}</span></td>
                <td>${a?a.icon+' '+a.name:it.ai}</td>
                <td><span class="status-pill ${cls}">● ${txt}</span></td>
                <td style="font-size:12px;color:var(--text-sub);font-family:Consolas,monospace;">${it.last}</td>
                <td><button class="btn btn-outline" style="padding:3px 10px;font-size:11px;">详情</button></td>
            </tr>
        `;
    }).join('');
}
