/* ===========================
   industry.js - 行业方案库
   =========================== */

const IndustrySolutions = [
    { icon: '⚗️', title: '化工园区·AI安全生产预警',
      desc: '覆盖有毒/可燃气体泄漏、烟火识别、人员闯入、危化品装车等场景，适配Ⅰ类专利自适应算法，支持通过Ⅱ类边缘盒子就地预警。',
      used: 38, devices: 124, models: 8,
      patents: ['Ⅰ类算法·气体烟火多协议接入', 'Ⅰ类芯片·4-20mA/RS485预处理', 'Ⅱ类盒子·现场防爆款'] },
    { icon: '🏭', title: '智能制造·预测性维护方案',
      desc: '基于振动/电流/温度多维信号的设备健康评估，自动识别西门子、发那科、三菱等主流PLC协议，一键部署寿命预测模型。',
      used: 45, devices: 206, models: 9,
      patents: ['Ⅰ类算法·多PLC协议库', 'Ⅰ类芯片·IEPE振动信号滤波', 'Ⅱ类盒子·工业导轨款'] },
    { icon: '⚡', title: '电力能源·变电站智能巡检',
      desc: '兼容IEC61850、Modbus TCP等电力协议，覆盖一次设备温度监测、GIS局放、仪表识别、SF6气体泄漏全场景。',
      used: 29, devices: 88, models: 6,
      patents: ['Ⅰ类算法·IEC61850适配', 'Ⅰ类芯片·高频局放采样', 'Ⅱ类盒子·电力4U款'] },
    { icon: '🌾', title: '智慧农业·设施农业控制',
      desc: '支持Modbus/LoRa/4G等农业常用链路，完成温室、灌溉、水产、畜牧的传感器接入与AI决策闭环。',
      used: 18, devices: 62, models: 4,
      patents: ['Ⅰ类算法·LoRa转JSON自动封装', 'Ⅰ类芯片·传感器小信号放大', 'Ⅱ类盒子·太阳能低功耗款'] },
    { icon: '🚚', title: '交通物流·智能卡口与集卡',
      desc: '高速公路车牌、车型、危险品识别 + 港口OCR与岸桥联动，内置RTSP/ONVIF/GB28181视觉协议库。',
      used: 22, devices: 74, models: 5,
      patents: ['Ⅰ类算法·视频流多路适配', 'Ⅰ类芯片·视频前端降噪', 'Ⅱ类盒子·车载防震款'] },
    { icon: '💧', title: '城市管网·供排水智能调度',
      desc: '覆盖加压站、二次供水、污水泵站的流量计/液位/水质接入，AI预测爆管风险，联动阀门调度。',
      used: 14, devices: 58, models: 4,
      patents: ['Ⅰ类算法·HART/Modbus混合协议', 'Ⅰ类芯片·电磁流量计滤波', 'Ⅱ类盒子·户外防水款'] },
];

window.init_industry = function() {
    const grid = document.getElementById('industryGrid');
    if (!grid) return;
    grid.innerHTML = IndustrySolutions.map(s => `
        <div class="industry-card">
            <div class="industry-banner">${s.icon}</div>
            <div class="industry-body">
                <div class="industry-title">${s.title}</div>
                <div class="industry-desc">${s.desc}</div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">
                    ${s.patents.map(p => `<span class="dev-tag" style="border-color:var(--warning);color:var(--warning);">${p}</span>`).join('')}
                </div>
                <div class="industry-meta">
                    <div class="industry-used">落地项目 <b style="color:var(--primary)">${s.used}</b> 个 · 接入设备 <b style="color:var(--success)">${s.devices}</b> 台 · 内置AI模型 <b style="color:var(--warning)">${s.models}</b> 个</div>
                    <button class="industry-btn" onclick="deployIndustry('${s.title}')">▶ 一键部署</button>
                </div>
            </div>
        </div>
    `).join('');
};

function deployIndustry(name) {
    pushLog('PLAT', 'SUCCESS', `行业方案【${name}】一键部署已启动，正在下发至关联边缘设备...`);
    alert(`✅ 方案启动：\n\n「${name}」\n\n系统将按以下步骤执行：\n1. 调用Ⅰ类自适应集成算法（自动识别现场设备协议）\n2. 启用Ⅰ类预处理芯片（信号清洗）\n3. 通过Ⅱ类边缘计算设备下发配置\n4. 在本服务平台加载对应AI模型组\n\n（演示模式：已模拟启动，请查看运行日志）`);
}
window.deployIndustry = deployIndustry;
