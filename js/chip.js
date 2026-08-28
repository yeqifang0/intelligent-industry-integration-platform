/* ===========================
   chip.js - 芯片与数据链路页
   =========================== */

let rawSigInst = null, cleanSigInst = null;
let chipTimer = null;

window.init_chip = function() {
    // 初始化数据
    updateChipStats();
    initRawSignal();
    initCleanSignal();
    startChipFlow();

    // 绑定开关
    document.getElementById('noiseToggle').onchange = startChipFlow;
    document.getElementById('filterToggle').onchange = startChipFlow;
};

function updateChipStats() {
    document.getElementById('chipNoiseVal').textContent = (T.rand(35, 42)).toFixed(1);
    document.getElementById('chipSNR').textContent = (T.rand(28, 35)).toFixed(1);
    document.getElementById('chipSR').textContent = T.randInt(200, 500);
    document.getElementById('chipLat').textContent = T.randInt(12, 45);
}

/* 原始信号图 */
function initRawSignal() {
    const el = document.getElementById('rawSignalChart');
    if (!el) return;
    if (rawSigInst) rawSigInst.dispose();
    rawSigInst = echarts.init(el);
    rawSigInst.setOption(buildSignalOption('原始信号', '#ff6b6b', 0.6, true));
    window.addEventListener('resize', () => rawSigInst.resize());
}

/* 干净信号图 */
function initCleanSignal() {
    const el = document.getElementById('cleanSignalChart');
    if (!el) return;
    if (cleanSigInst) cleanSigInst.dispose();
    cleanSigInst = echarts.init(el);
    cleanSigInst.setOption(buildSignalOption('预处理后信号', '#00ff88', 1, false));
    window.addEventListener('resize', () => cleanSigInst.resize());
}

function buildSignalOption(name, color, opacity, isNoisy) {
    return {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(12,23,50,0.95)',
            borderColor: '#1f3469',
            textStyle: { color: '#d8e3f3' }
        },
        grid: { top: 15, left: 40, right: 15, bottom: 22 },
        xAxis: {
            type: 'category',
            data: Array.from({length: 200}, (_, i) => i),
            axisLine: { lineStyle: { color: '#1f3469' } },
            axisLabel: { color: '#7a8eb5', fontSize: 10, interval: 30 }
        },
        yAxis: {
            type: 'value', min: -50, max: 120,
            axisLine: { lineStyle: { color: '#1f3469' } },
            axisLabel: { color: '#7a8eb5', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(31,52,105,0.3)' } }
        },
        series: [{
            name: name, type: 'line', symbol: 'none',
            data: Array(200).fill(0),
            lineStyle: { width: isNoisy ? 1 : 2.2, color: color, opacity: opacity },
            areaStyle: isNoisy ? null : {
                color: new echarts.graphic.LinearGradient(0,0,0,1,[
                    {offset:0,color:'rgba(0,255,136,0.25)'},
                    {offset:1,color:'rgba(0,255,136,0.02)'}
                ])
            }
        }]
    };
}

/* 生成信号并做滤波模拟 */
let sigPhase = 0;
function startChipFlow() {
    if (chipTimer) clearInterval(chipTimer);
    const noiseOn = document.getElementById('noiseToggle').checked;
    const filterOn = document.getElementById('filterToggle').checked;

    // 高亮芯片模块动画
    const mods = ['modAmp', 'modFilter', 'modADC', 'modDSP'];
    mods.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        setTimeout(() => {
            el.classList.add('active');
            setTimeout(() => el.classList.remove('active'), 1200);
        }, i * 350);
    });

    chipTimer = setInterval(() => {
        const N = 200;
        const raw = [], clean = [];
        let sumRawSq = 0, sumNoiseSq = 0;
        for (let i = 0; i < N; i++) {
            sigPhase += 0.003;
            const t = i / 12;
            // 真实信号：两正弦叠加
            const real = Math.sin(t + sigPhase) * 40 + Math.cos(t * 0.3 + sigPhase) * 15 + 10;
            // 噪声
            const gauss = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
            const highFreq = Math.sin(t * 9) * 8;
            const noise = noiseOn ? (gauss * 14 + highFreq) : 0;
            const rawVal = real + noise;
            raw.push(rawVal);

            // 简易滤波：移动平均（模拟芯片）
            let filt = rawVal;
            if (filterOn) {
                const w = 7;
                let sum = 0, cnt = 0;
                for (let k = Math.max(0, clean.length - w); k < clean.length; k++) {
                    sum += clean[k] ? clean[k]._real : real;
                    cnt++;
                }
                if (cnt) filt = (sum + real) / (cnt + 1);
                else filt = real * 0.65 + rawVal * 0.35;
                // 再加一点轻度低通
                if (clean.length) {
                    const prev = clean[clean.length - 1];
                    filt = prev * 0.45 + filt * 0.55;
                }
            }
            const _c = { value: filt, _real: real };
            clean.push(_c);
            sumRawSq += (rawVal - real) * (rawVal - real);
            sumNoiseSq += (filt - real) * (filt - real);
        }

        // SNR计算
        const snrBefore = 10 * Math.log10(1600 / (sumRawSq / N + 1e-6));
        const snrAfter = 10 * Math.log10(1600 / (sumNoiseSq / N + 1e-6));
        document.getElementById('snrBefore').textContent = snrBefore.toFixed(1);
        document.getElementById('snrAfter').textContent = snrAfter.toFixed(1);
        document.getElementById('chipSNR').textContent = (snrAfter - snrBefore).toFixed(1);

        rawSigInst.setOption({ series: [{ data: raw }] });
        cleanSigInst.setOption({ series: [{ data: clean.map(c => c.value) }] });
    }, 1600);
}
