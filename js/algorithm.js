/* ===========================
   algorithm.js - 核心算法流程图
   =========================== */

let algoFlowInst = null;

window.init_algorithm = function() {
    drawAlgorithmFlow();
};

function drawAlgorithmFlow() {
    const el = document.getElementById('algoFlowChart');
    if (!el) return;
    if (algoFlowInst) algoFlowInst.dispose();
    algoFlowInst = echarts.init(el);

    // 用自定义节点关系图（graph）画算法流程
    const data = [
        { id: 'trigger', name: '算法触发\n(新增设备/热插拔/集成任务)', x: 0, y: 0,
          category: 0, itemStyle: { color: '#ff6b6b' },
          label: '▶ 算法触发' },

        { id: 's1', name: 'Step1\n设备接入与数据采集', x: 0, y: 1,
          category: 1,
          label: 'Step1 设备接入识别' },
        { id: 's1_1', name: '识别DeviceID/MAC/序列号', x: -1.5, y: 1.8, category: 2, label: 'Device ID 识别' },
        { id: 's1_2', name: '探测接口类型', x: 0, y: 1.8, category: 2, label: '接口探测\nRS485/Modbus/MQTT...' },
        { id: 's1_3', name: '截取原始数据样本', x: 1.5, y: 1.8, category: 2, label: '样本采集\n前N帧/前N秒' },

        { id: 's2', name: 'Step2\n数据指纹特征提取', x: 0, y: 2.7,
          category: 1,
          label: 'Step2 数据指纹提取' },
        { id: 's2_1', name: '结构特征', x: -1.6, y: 3.5, category: 2, label: '结构特征\n帧头帧尾/分隔符/校验' },
        { id: 's2_2', name: '时序特征', x: 0, y: 3.5, category: 2, label: '时序特征\n采样率/周期/突变' },
        { id: 's2_3', name: '内容特征', x: 1.6, y: 3.5, category: 2, label: '内容特征\n范围/枚举/编码' },

        { id: 's3', name: 'Step3\n协议/驱动库匹配', x: 0, y: 4.4,
          category: 1,
          label: 'Step3 协议自动匹配' },
        { id: 's3_1', name: '指纹向量余弦比对', x: -1.3, y: 5.2, category: 2, label: '指纹向量\n余弦相似度' },
        { id: 's3_2', name: '驱动库查表', x: 1.3, y: 5.2, category: 2, label: '驱动库查表\n100+协议驱动' },

        { id: 's4', name: 'Step4\n数据格式转换', x: 0, y: 6.1,
          category: 1,
          label: 'Step4 格式转换(方言→普通话)' },
        { id: 's4_1', name: '解码+量纲转换', x: -1.3, y: 6.9, category: 2, label: '解码+量纲\nByte→物理单位' },
        { id: 's4_2', name: 'JSON标准化', x: 0, y: 6.9, category: 2, label: '输出标准JSON' },
        { id: 's4_3', name: 'Tensor封装', x: 1.3, y: 6.9, category: 2, label: '封装AI张量Tensor' },

        { id: 's5', name: 'Step5\nAI应用对接下发', x: 0, y: 7.8,
          category: 1,
          label: 'Step5 AI应用对接' },
        { id: 's5_1', name: '模型加载', x: -1.5, y: 8.6, category: 2, label: '加载AI模型\n(用户所选应用)' },
        { id: 's5_2', name: '生成集成配置', x: 0, y: 8.6, category: 2, label: '生成绑定配置文件' },
        { id: 's5_3', name: '边缘盒子下发MQTT', x: 1.5, y: 8.6, category: 2, label: 'MQTT下发\nto 边缘盒子' },

        { id: 'out', name: '输出\n标准数据/指令/心跳', x: 0, y: 9.5,
          category: 3, itemStyle: { color: '#00ff88' },
          label: '✅ 算法输出' },
    ];

    const links = [
        { source: 'trigger', target: 's1' },
        { source: 's1', target: 's1_1' }, { source: 's1', target: 's1_2' }, { source: 's1', target: 's1_3' },
        { source: 's1_1', target: 's2' }, { source: 's1_2', target: 's2' }, { source: 's1_3', target: 's2' },
        { source: 's2', target: 's2_1' }, { source: 's2', target: 's2_2' }, { source: 's2', target: 's2_3' },
        { source: 's2_1', target: 's3' }, { source: 's2_2', target: 's3' }, { source: 's2_3', target: 's3' },
        { source: 's3', target: 's3_1' }, { source: 's3', target: 's3_2' },
        { source: 's3_1', target: 's4' }, { source: 's3_2', target: 's4' },
        { source: 's4', target: 's4_1' }, { source: 's4', target: 's4_2' }, { source: 's4', target: 's4_3' },
        { source: 's4_1', target: 's5' }, { source: 's4_2', target: 's5' }, { source: 's4_3', target: 's5' },
        { source: 's5', target: 's5_1' }, { source: 's5', target: 's5_2' }, { source: 's5', target: 's5_3' },
        { source: 's5_1', target: 'out' }, { source: 's5_2', target: 'out' }, { source: 's5_3', target: 'out' },
    ];

    const nodes = data.map(d => ({
        id: d.id,
        name: d.label || d.name,
        x: (d.x + 2) * 120,
        y: d.y * 70,
        category: d.category || 0,
        symbolSize: d.category === 1 ? 68 : d.category === 0 ? 60 : 52,
        itemStyle: d.itemStyle || {
            color: d.category === 1 ? '#00d4ff' : d.category === 0 ? '#ff6b6b'
                  : d.category === 3 ? '#00ff88' : '#2a4485',
            borderColor: d.category === 1 ? '#00d4ff' : d.category === 3 ? '#00ff88' : '#ff9f43',
            borderWidth: 2,
            shadowBlur: d.category === 1 ? 15 : 6,
            shadowColor: d.category === 1 ? 'rgba(0,212,255,0.5)' : undefined
        },
        label: {
            show: true, position: 'inside',
            color: d.category === 2 ? '#cfe0ff' : '#fff',
            fontSize: d.category === 1 ? 12 : 10,
            fontWeight: d.category === 1 ? 'bold' : 'normal',
            formatter: p => p.name,
            lineHeight: 14
        }
    }));

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            formatter: p => {
                const raw = data.find(x => x.id === p.data.id);
                return raw ? `<b>${raw.name.replace(/\n/g,'<br/>')}</b>` : p.name;
            },
            backgroundColor: 'rgba(12,23,50,0.95)',
            borderColor: '#1f3469',
            textStyle: { color: '#d8e3f3' }
        },
        animationDuration: 800,
        series: [{
            type: 'graph',
            layout: 'none',
            roam: true,
            draggable: true,
            data: nodes,
            links: links.map(l => ({
                source: l.source, target: l.target,
                lineStyle: { color: '#1f3469', width: 1.6, curveness: 0.05 },
                label: { show: false }
            })),
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: [0, 8],
            categories: [
                { name: '触发' }, { name: '核心步骤' }, { name: '子步骤' }, { name: '输出' }
            ]
        }]
    };
    algoFlowInst.setOption(option);
    window.addEventListener('resize', () => algoFlowInst.resize());
}
