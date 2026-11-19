/* ===========================
   dashboard.js - 驾驶舱大屏
   =========================== */

window.init_dashboard = function() {
    if (!window.echarts) {
        console.warn('[dashboard] ECharts 未加载，图表无法渲染');
        return;
    }
    renderPatentStats();
    renderKPI();
    initMapChart();
    initRealtimeChart();
    initIndustryChart();
    initSignalCompareChart();
    // 容器尺寸可能在首次渲染时尚未计算完成，下一帧再校正一次
    requestAnimationFrame(() => {
        [mapChartInst, rtChartInst, indChartInst, sigChartInst].forEach(c => c && c.resize());
    });
};

function renderPatentStats() {
    T.animateNum('adaptionCount', 8642);
    T.animateNum('chipProcessCount', 1258);
    T.animateNum('deviceOnlineCount', 342);
    T.animateNum('apiCallCount', 248391);
}
function renderKPI() {
    T.animateNum('totalDevices', 412);
    T.animateNum('totalModels', 28);
    T.animateNum('alertCount', 17);
    T.animateNum('totalIndustries', 6);
}

/* 地理分布图（用散点图模拟省份分布） */
let mapChartInst = null;
function initMapChart() {
    const el = document.getElementById('mapChart');
    if (!el) return;
    if (mapChartInst) mapChartInst.dispose();
    mapChartInst = echarts.init(el);

    // 模拟各省份设备数量（省会大致坐标）
    const provinceData = [
        { name: '北京', value: [116.4, 39.9, 58] },
        { name: '上海', value: [121.5, 31.2, 42] },
        { name: '广东', value: [113.3, 23.1, 76] },
        { name: '江苏', value: [118.8, 32.1, 64] },
        { name: '浙江', value: [120.2, 30.3, 51] },
        { name: '山东', value: [117.0, 36.7, 38] },
        { name: '四川', value: [104.1, 30.7, 29] },
        { name: '湖北', value: [114.3, 30.6, 24] },
        { name: '陕西', value: [108.9, 34.3, 19] },
        { name: '福建', value: [119.3, 26.1, 22] },
        { name: '辽宁', value: [123.4, 41.8, 16] },
        { name: '新疆', value: [87.6, 43.8, 12] },
        { name: '云南', value: [102.7, 25.0, 14] },
        { name: '河北', value: [114.5, 38.0, 21] },
        { name: '河南', value: [113.6, 34.8, 27] },
    ];

    // 画一个类似地理分布的散点图（无地图GeoJSON时用笛卡尔坐标系+散点模拟）
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(12,23,50,0.95)',
            borderColor: '#1f3469',
            textStyle: { color: '#d8e3f3' },
            formatter: p => `${p.data.name}<br/>设备数: <b style="color:#00d4ff">${p.data.value[2]}</b> 台`
        },
        grid: { top: 20, left: 40, right: 30, bottom: 30 },
        xAxis: {
            type: 'value', min: 73, max: 136, show: false
        },
        yAxis: {
            type: 'value', min: 18, max: 54, show: false
        },
        visualMap: {
            show: false, min: 10, max: 80,
            inRange: { color: ['#00d4ff', '#ffd700', '#ff6b6b'] }
        },
        series: [
            {
                type: 'effectScatter',
                coordinateSystem: 'cartesian2d',
                data: provinceData,
                symbolSize: v => Math.max(8, v[2] * 0.55),
                rippleEffect: { period: 4, scale: 4, brushType: 'stroke' },
                itemStyle: { shadowBlur: 10, shadowColor: '#00d4ff' },
                label: {
                    show: true, formatter: p => p.data.name,
                    position: 'right', fontSize: 10,
                    color: '#a5b8da'
                }
            },
            {
                type: 'scatter',
                coordinateSystem: 'cartesian2d',
                data: provinceData,
                symbolSize: 1,
                itemStyle: { color: 'transparent' },
                label: {
                    show: true, formatter: p => p.data.value[2],
                    position: 'inside', fontSize: 10,
                    color: '#fff', fontWeight: 600
                }
            }
        ]
    };
    mapChartInst.setOption(option);
    window.addEventListener('resize', () => mapChartInst.resize());
}

/* 实时数据流 */
let rtChartInst = null;
let rtTimer = null;
let rtData = { dev: [], ai: [], chip: [], time: [] };
function initRealtimeChart() {
    const el = document.getElementById('realtimeChart');
    if (!el) return;
    if (rtChartInst) rtChartInst.dispose();
    if (rtTimer) clearInterval(rtTimer);
    rtData = { dev: [], ai: [], chip: [], time: [] };
    rtChartInst = echarts.init(el);

    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
        const t = new Date(now - i * 10000);
        rtData.time.push(`${T.pad(t.getHours())}:${T.pad(t.getMinutes())}:${T.pad(t.getSeconds())}`);
        rtData.dev.push(T.randInt(320, 360));
        rtData.ai.push(T.randInt(60, 95));
        rtData.chip.push(T.randInt(1800, 2400));
    }

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(12,23,50,0.95)',
            borderColor: '#1f3469',
            textStyle: { color: '#d8e3f3' }
        },
        legend: {
            textStyle: { color: '#a5b8da', fontSize: 11 },
            right: 10, top: 0,
            data: ['在线设备', 'AI推理(次/s)', '芯片处理(k/s)']
        },
        grid: { top: 30, left: 40, right: 20, bottom: 25 },
        xAxis: {
            type: 'category', boundaryGap: false,
            data: rtData.time,
            axisLine: { lineStyle: { color: '#1f3469' } },
            axisLabel: { color: '#7a8eb5', fontSize: 10, interval: 4 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#1f3469' } },
            axisLabel: { color: '#7a8eb5', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(31,52,105,0.3)' } }
        },
        series: [
            {
                name: '在线设备', type: 'line', smooth: true,
                data: rtData.dev, symbol: 'none',
                lineStyle: { width: 2, color: '#00d4ff' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0,0,0,1,[
                        {offset:0,color:'rgba(0,212,255,0.35)'},
                        {offset:1,color:'rgba(0,212,255,0.02)'}
                    ])
                }
            },
            {
                name: 'AI推理(次/s)', type: 'line', smooth: true,
                data: rtData.ai, symbol: 'none',
                lineStyle: { width: 2, color: '#ffd700' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0,0,0,1,[
                        {offset:0,color:'rgba(255,215,0,0.3)'},
                        {offset:1,color:'rgba(255,215,0,0.02)'}
                    ])
                }
            },
            {
                name: '芯片处理(k/s)', type: 'line', smooth: true,
                data: rtData.chip, symbol: 'none',
                lineStyle: { width: 2, color: '#00ff88' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0,0,0,1,[
                        {offset:0,color:'rgba(0,255,136,0.25)'},
                        {offset:1,color:'rgba(0,255,136,0.02)'}
                    ])
                }
            }
        ]
    };
    rtChartInst.setOption(option);
    window.addEventListener('resize', () => rtChartInst.resize());

    // 定时更新
    rtTimer = setInterval(() => {
        const t = new Date();
        rtData.time.push(`${T.pad(t.getHours())}:${T.pad(t.getMinutes())}:${T.pad(t.getSeconds())}`);
        rtData.time.shift();
        rtData.dev.push(Math.max(300, (rtData.dev[rtData.dev.length-1] + T.randInt(-5, 6))));
        rtData.dev.shift();
        rtData.ai.push(Math.max(50, (rtData.ai[rtData.ai.length-1] + T.randInt(-4, 5))));
        rtData.ai.shift();
        rtData.chip.push(Math.max(1600, (rtData.chip[rtData.chip.length-1] + T.randInt(-80, 100))));
        rtData.chip.shift();
        rtChartInst.setOption({
            xAxis: { data: rtData.time },
            series: [
                { data: rtData.dev },
                { data: rtData.ai },
                { data: rtData.chip }
            ]
        });
    }, 4000);
}

/* 行业占比饼图 */
let indChartInst = null;
function initIndustryChart() {
    const el = document.getElementById('industryChart');
    if (!el) return;
    if (indChartInst) indChartInst.dispose();
    indChartInst = echarts.init(el);
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(12,23,50,0.95)',
            borderColor: '#1f3469',
            textStyle: { color: '#d8e3f3' },
            formatter: '{b}: {c} 个项目 ({d}%)'
        },
        legend: {
            orient: 'vertical', right: 5, top: 'center',
            textStyle: { color: '#a5b8da', fontSize: 11 },
            itemWidth: 10, itemHeight: 10
        },
        series: [{
            type: 'pie',
            radius: ['45%', '72%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: '#0c1732', borderWidth: 2 },
            label: {
                color: '#a5b8da', fontSize: 11,
                formatter: '{b}\n{d}%'
            },
            labelLine: { lineStyle: { color: '#1f3469' } },
            data: [
                { value: 38, name: '化工园区', itemStyle: { color: '#ff6b6b' } },
                { value: 45, name: '智能制造', itemStyle: { color: '#00d4ff' } },
                { value: 29, name: '电力能源', itemStyle: { color: '#ffd700' } },
                { value: 18, name: '智慧农业', itemStyle: { color: '#00ff88' } },
                { value: 22, name: '交通物流', itemStyle: { color: '#a855f7' } },
                { value: 14, name: '城市管网', itemStyle: { color: '#14b8a6' } }
            ]
        }]
    };
    indChartInst.setOption(option);
    window.addEventListener('resize', () => indChartInst.resize());
}

/* 驾驶舱的原始/滤波信号对比图 */
let sigChartInst = null;
function initSignalCompareChart() {
    const el = document.getElementById('signalChart');
    if (!el) return;
    if (sigChartInst) sigChartInst.dispose();
    sigChartInst = echarts.init(el);

    const N = 200;
    const raw = [], clean = [], idx = [];
    for (let i = 0; i < N; i++) {
        const t = i / N * 8 * Math.PI;
        raw.push(Math.sin(t) * 50 + 25 + (Math.random() - 0.5) * 40 + Math.sin(t * 7) * 15);
        clean.push(Math.sin(t) * 50 + 25);
        idx.push(i);
    }

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(12,23,50,0.95)',
            borderColor: '#1f3469',
            textStyle: { color: '#d8e3f3' }
        },
        legend: {
            textStyle: { color: '#a5b8da', fontSize: 11 },
            right: 10, top: 0,
            data: ['原始信号（带噪）', '预处理后（芯片输出）']
        },
        grid: { top: 30, left: 40, right: 20, bottom: 25 },
        xAxis: {
            type: 'category', data: idx, show: false
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#1f3469' } },
            axisLabel: { color: '#7a8eb5', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(31,52,105,0.3)' } }
        },
        series: [
            {
                name: '原始信号（带噪）', type: 'line', symbol: 'none',
                data: raw,
                lineStyle: { width: 1, color: '#ff6b6b', opacity: 0.85 },
                itemStyle: { color: '#ff6b6b' }
            },
            {
                name: '预处理后（芯片输出）', type: 'line', symbol: 'none',
                data: clean,
                lineStyle: { width: 2.2, color: '#00ff88' },
                itemStyle: { color: '#00ff88' }
            }
        ]
    };
    sigChartInst.setOption(option);
    window.addEventListener('resize', () => sigChartInst.resize());
}
