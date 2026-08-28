/* ===========================
   devices.js - 边缘设备管理
   =========================== */

const DevicesData = [
    { id: 'EDGE-0001', name: '化工园区·一号边缘盒子', loc: '江苏·苏州化工园A区', industry: '化工', status: 'online',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:01', sn: 'SN2025G30001', cpu: 42, mem: 58, temp: 49,
      tags: ['RS485×8','Modbus','MQTT','预处理芯片(Ⅰ类)'], uptime: '128天 04小时',
      sensors: [ { name: '温度传感器×12', proto: 'Modbus RTU' }, { name: '压力变送器×6', proto: '4-20mA' }, { name: '烟火摄像头×4', proto: 'RTSP' } ] },
    { id: 'EDGE-0002', name: '智能制造·总装车间盒子', loc: '广东·深圳工厂2号厂房', industry: '制造', status: 'online',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:02', sn: 'SN2025G30002', cpu: 67, mem: 72, temp: 56,
      tags: ['OPC-UA','PLC对接','视觉检测'], uptime: '92天 11小时',
      sensors: [ { name: '西门子PLC S7-1500', proto: 'OPC-UA' }, { name: '工业相机×6', proto: 'GigE' }, { name: '机械臂控制器×3', proto: 'TCP' } ] },
    { id: 'EDGE-0003', name: '电力能源·变电站监测', loc: '湖北·宜昌220kV变电站', industry: '电力', status: 'warning',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:03', sn: 'SN2025G30003', cpu: 81, mem: 85, temp: 68,
      tags: ['IEC61850','电流传感','振动监测'], uptime: '156天 21小时',
      sensors: [ { name: '电流互感器×6', proto: 'IEC61850' }, { name: '振动传感器×12', proto: 'IEPE' }, { name: '环境温湿度×4', proto: 'RS485' } ] },
    { id: 'EDGE-0004', name: '智慧农业·灌溉控制站', loc: '新疆·阿克苏棉田基地', industry: '农业', status: 'online',
      model: 'IEC-7120-G2L', mac: 'AC:1F:6B:42:10:04', sn: 'SN2025G2L0004', cpu: 28, mem: 41, temp: 44,
      tags: ['4G/LTE','低功耗','太阳能'], uptime: '68天 08小时',
      sensors: [ { name: '土壤温湿度×16', proto: 'Modbus' }, { name: '气象站', proto: 'RS232' }, { name: '电磁阀控制器×8', proto: 'LoRa' } ] },
    { id: 'EDGE-0005', name: '交通物流·高速龙门架', loc: '山东·济南G20高速K120', industry: '交通', status: 'online',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:05', sn: 'SN2025G30005', cpu: 55, mem: 63, temp: 52,
      tags: ['车牌识别','车型分类','光纤接入'], uptime: '110天 15小时',
      sensors: [ { name: '卡口相机×2', proto: 'RTSP/ONVIF' }, { name: '地感线圈×2', proto: 'IO' }, { name: '补光灯控制器', proto: 'RS485' } ] },
    { id: 'EDGE-0006', name: '城市管网·供水中转站', loc: '北京·通州水厂加压站', industry: '制造', status: 'offline',
      model: 'IEC-7120-G2L', mac: 'AC:1F:6B:42:10:06', sn: 'SN2025G2L0006', cpu: 0, mem: 0, temp: 0,
      tags: ['流量监测','液位计','SCADA'], uptime: '离线',
      sensors: [ { name: '电磁流量计×3', proto: 'Modbus RTU' }, { name: '雷达液位计×2', proto: 'HART' } ] },
    { id: 'EDGE-0007', name: '化工园区·危化品仓库', loc: '浙江·宁波化工园B区', industry: '化工', status: 'warning',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:07', sn: 'SN2025G30007', cpu: 74, mem: 79, temp: 61,
      tags: ['气体检测','防爆认证','消防联动'], uptime: '141天 02小时',
      sensors: [ { name: '可燃气体探测器×18', proto: 'RS485' }, { name: '有毒气体VOC×6', proto: 'Modbus' }, { name: '消防烟感×12', proto: '私有协议' } ] },
    { id: 'EDGE-0008', name: '智能制造·焊接工位', loc: '上海·汽车城焊装车间', industry: '制造', status: 'online',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:08', sn: 'SN2025G30008', cpu: 61, mem: 68, temp: 55,
      tags: ['焊接质量','电流波形','缺陷检测'], uptime: '75天 18小时',
      sensors: [ { name: '焊接电源监测', proto: 'DeviceNet' }, { name: '高速工业相机', proto: 'CoaXPress' } ] },
    { id: 'EDGE-0009', name: '电力能源·风电场A08', loc: '云南·大理风电场', industry: '电力', status: 'online',
      model: 'IEC-7120-G2L', mac: 'AC:1F:6B:42:10:09', sn: 'SN2025G2L0009', cpu: 37, mem: 52, temp: 47,
      tags: ['风机预测维护','振动分析','北斗'], uptime: '201天 09小时',
      sensors: [ { name: '主轴振动×3', proto: 'IEPE' }, { name: '发电机电流×3', proto: '0-5V' }, { name: '风速风向仪', proto: 'RS485' } ] },
    { id: 'EDGE-0010', name: '智慧农业·大棚控制中心', loc: '山东·寿光蔬菜基地', industry: '农业', status: 'online',
      model: 'IEC-7120-G2L', mac: 'AC:1F:6B:42:10:10', sn: 'SN2025G2L0010', cpu: 31, mem: 44, temp: 43,
      tags: ['卷帘通风','水肥一体','光照调控'], uptime: '52天 22小时',
      sensors: [ { name: '温湿度光CO2×12', proto: 'Modbus' }, { name: '卷帘电机×4', proto: 'RS485' }, { name: '电磁阀水肥×16', proto: 'LoRa' } ] },
    { id: 'EDGE-0011', name: '交通物流·港口集装箱', loc: '福建·厦门港海天码头', industry: '交通', status: 'online',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:11', sn: 'SN2025G30011', cpu: 59, mem: 66, temp: 54,
      tags: ['OCR识别','岸桥监测','GPS定位'], uptime: '118天 07小时',
      sensors: [ { name: '箱号识别相机×8', proto: 'RTSP' }, { name: '岸桥PLC', proto: 'Profinet' } ] },
    { id: 'EDGE-0012', name: '化工园区·三废处理', loc: '河北·沧州化工园', industry: '化工', status: 'online',
      model: 'IEC-7120-G3', mac: 'AC:1F:6B:42:10:12', sn: 'SN2025G30012', cpu: 48, mem: 60, temp: 50,
      tags: ['PH监测','流量计','加药控制'], uptime: '83天 14小时',
      sensors: [ { name: 'PH/ORP计×4', proto: 'Modbus' }, { name: '在线COD分析仪', proto: 'RS232' }, { name: '加药计量泵×6', proto: '4-20mA' } ] },
];

let devicesFiltered = [...DevicesData];

window.init_devices = function() {
    renderDeviceStats();
    renderDeviceList();
    document.getElementById('deviceSearch').oninput = renderDeviceList;
    document.getElementById('filterStatus').onchange = renderDeviceList;
    document.getElementById('filterIndustry').onchange = renderDeviceList;
};

function renderDeviceStats() {
    const total = DevicesData.length;
    const online = DevicesData.filter(d => d.status === 'online').length;
    const offline = DevicesData.filter(d => d.status === 'offline').length;
    const warning = DevicesData.filter(d => d.status === 'warning').length;
    T.animateNum('statOnline', online);
    T.animateNum('statOffline', offline);
    T.animateNum('statWarning', warning);
    T.animateNum('statTotal', total);
}

function renderDeviceList() {
    const kw = document.getElementById('deviceSearch').value.trim();
    const st = document.getElementById('filterStatus').value;
    const ind = document.getElementById('filterIndustry').value;
    devicesFiltered = DevicesData.filter(d => {
        if (st && d.status !== st) return false;
        if (ind && d.industry !== ind) return false;
        if (kw) {
            const s = (d.id + d.name + d.mac + d.sn + d.loc).toLowerCase();
            if (!s.includes(kw.toLowerCase())) return false;
        }
        return true;
    });
    const grid = document.getElementById('deviceGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!devicesFiltered.length) {
        grid.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-sub);">未找到匹配的设备</div>`;
        return;
    }
    devicesFiltered.forEach((d, i) => {
        const card = document.createElement('div');
        card.className = 'device-box';
        card.onclick = () => openDeviceModal(i);
        const statusLabel = { online: '在线', offline: '离线', warning: '告警' }[d.status];
        const industryIcon = {
            '化工': '⚗️', '制造': '🏭', '电力': '⚡',
            '农业': '🌾', '交通': '🚚'
        }[d.industry] || '📦';
        card.innerHTML = `
            <div class="dev-header">
                <div>
                    <div class="dev-name">${industryIcon} ${d.name}</div>
                    <div class="dev-loc">📍 ${d.loc} · ${d.id}</div>
                </div>
                <div class="dev-status ${d.status}">● ${statusLabel}</div>
            </div>
            <div class="dev-metrics">
                <div class="dev-metric">
                    <div class="lbl">CPU使用率</div>
                    <div class="val">${d.cpu}%</div>
                </div>
                <div class="dev-metric">
                    <div class="lbl">内存</div>
                    <div class="val">${d.mem}%</div>
                </div>
                <div class="dev-metric">
                    <div class="lbl">温度</div>
                    <div class="val">${d.temp}℃</div>
                </div>
            </div>
            <div class="dev-tags">
                ${d.tags.slice(0, 4).map(t => `<span class="dev-tag">${t}</span>`).join('')}
            </div>
        `;
        grid.appendChild(card);
    });
}

function openDeviceModal(idx) {
    const d = devicesFiltered[idx];
    if (!d) return;
    const statusLabel = { online: '在线', offline: '离线', warning: '告警' }[d.status];
    document.getElementById('modalTitle').textContent = `设备详情 · ${d.name}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="info-grid">
            <div class="info-group">
                <div class="info-group-title">📋 基本信息</div>
                <div class="info-row"><span class="k">设备编号</span><span class="v">${d.id}</span></div>
                <div class="info-row"><span class="k">设备型号</span><span class="v">${d.model} (实用新型专利)</span></div>
                <div class="info-row"><span class="k">序列号</span><span class="v">${d.sn}</span></div>
                <div class="info-row"><span class="k">MAC地址</span><span class="v">${d.mac}</span></div>
                <div class="info-row"><span class="k">行业场景</span><span class="v">${d.industry}</span></div>
                <div class="info-row"><span class="k">部署位置</span><span class="v">${d.loc}</span></div>
                <div class="info-row"><span class="k">运行状态</span><span class="v"><span class="status-pill ${d.status==='online'?'success':d.status==='warning'?'warning':'success'}" style="display:inline-block;">${statusLabel}</span></span></div>
                <div class="info-row"><span class="k">运行时长</span><span class="v">${d.uptime}</span></div>
            </div>
            <div class="info-group">
                <div class="info-group-title">🔧 硬件指标</div>
                <div class="info-row"><span class="k">CPU</span><span class="v">${d.cpu}% ${d.cpu>80?'⚠ 高负载':''}</span></div>
                <div class="info-row"><span class="k">内存</span><span class="v">${d.mem}% ${d.mem>85?'⚠ 高占用':''}</span></div>
                <div class="info-row"><span class="k">核心温度</span><span class="v">${d.temp}℃ ${d.temp>65?'⚠ 温度过高':''}</span></div>
                <div class="info-row"><span class="k">集成芯片</span><span class="v">✅ AI模拟信号预处理芯片 (Ⅰ类布图)</span></div>
                <div class="info-row"><span class="k">算法引擎</span><span class="v">✅ 跨平台自适应集成系统 (Ⅰ类专利)</span></div>
                <div class="info-row"><span class="k">串口</span><span class="v">RS485×8 · RS232×2</span></div>
                <div class="info-row"><span class="k">网口</span><span class="v">千兆×2 · 支持POE</span></div>
                <div class="info-row"><span class="k">其他</span><span class="v">LoRa/4G/北斗(可选)</span></div>
            </div>
        </div>
        <div class="info-group">
            <div class="info-group-title">🔌 已接入现场设备（数据链路）</div>
            <table class="data-table">
                <thead><tr><th>设备类型</th><th>协议/接口</th><th>接入状态</th><th>专利覆盖</th></tr></thead>
                <tbody>
                    ${d.sensors.map(s => `
                        <tr>
                            <td>${s.name}</td>
                            <td><span class="dev-proto-tag">${s.proto}</span></td>
                            <td><span class="status-pill success">已识别</span></td>
                            <td style="font-size:11px;color:var(--warning);">Ⅰ类算法自动适配</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline">⬇ 导出诊断报告</button>
            <button class="btn btn-outline">🔄 重启设备</button>
            <button class="btn btn-primary">🚀 远程部署AI模型</button>
        </div>
    `;
    document.getElementById('deviceModal').classList.add('show');
}

function closeModal() {
    document.getElementById('deviceModal').classList.remove('show');
}
window.closeModal = closeModal;

function addMockDevice() {
    const idNum = DevicesData.length + 1;
    const id = `EDGE-${String(idNum).padStart(4, '0')}`;
    const ind = T.pick(['化工', '制造', '电力', '农业', '交通']);
    const cities = ['江苏·苏州', '广东·深圳', '湖北·宜昌', '新疆·阿克苏', '山东·济南', '浙江·宁波', '河北·沧州', '福建·厦门'];
    const scene = {
        '化工': ['装置区监测', '危化品仓库', '三废处理', '罐区监测'],
        '制造': ['总装车间', '焊接工位', '机加工中心', '质量检测线'],
        '电力': ['变电站', '风电场', '光伏电站', '配电房'],
        '农业': ['灌溉控制', '大棚控制', '水产养殖', '畜牧监测'],
        '交通': ['高速龙门架', '港口码头', '物流枢纽', '公交场站']
    }[ind];
    const d = {
        id, name: `${ind == '制造' ? '智能制造' : ind == '电力' ? '电力能源' : ind == '农业' ? '智慧农业' : ind == '交通' ? '交通物流' : '化工园区'}·${T.pick(scene)}${T.randInt(2, 9)}`,
        loc: `${T.pick(cities)} ${T.randInt(1, 9)}号点位`, industry: ind, status: T.pick(['online', 'online', 'online', 'warning']),
        model: T.pick(['IEC-7120-G3', 'IEC-7120-G2L']),
        mac: `AC:1F:6B:42:${T.pad(T.randInt(10, 99))}:${T.pad(T.randInt(10, 99))}`,
        sn: `SN2025${T.pick(['G3', 'G2L'])}${String(T.randInt(1000, 9999))}`,
        cpu: T.randInt(20, 88), mem: T.randInt(30, 88), temp: T.randInt(40, 70),
        tags: [T.pick(['RS485×8', 'OPC-UA', 'MQTT', 'Modbus', '4G/LTE', 'LoRa']), '预处理芯片(Ⅰ类)', '自适应集成(Ⅰ类)', T.pick(['边缘算力', '低功耗', '千兆光纤'])],
        uptime: `${T.randInt(10, 200)}天 ${T.randInt(0, 23)}小时`,
        sensors: [
            { name: `温度/压力/流量传感器×${T.randInt(4, 20)}`, proto: T.pick(['Modbus RTU', 'RS485', '4-20mA']) },
            { name: `视频监控×${T.randInt(2, 8)}`, proto: T.pick(['RTSP', 'ONVIF', 'GB28181']) },
        ]
    };
    DevicesData.push(d);
    renderDeviceStats();
    renderDeviceList();
    pushLog('DEV', 'SUCCESS', `新增边缘设备 ${d.id} 已注册，型号：${d.model}`);
}
window.addMockDevice = addMockDevice;
