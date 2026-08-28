/* ===========================
   logs.js - 运行日志
   =========================== */

window.init_logs = function() {
    renderLogs();
};

function renderLogs() {
    const lv = document.getElementById('logLevel').value;
    const md = document.getElementById('logModule').value;
    const kw = document.getElementById('logSearch').value.trim().toLowerCase();
    const box = document.getElementById('logCenterBox');
    if (!box) return;

    let rows = window.GlobalLogs || [];
    if (lv) rows = rows.filter(r => r.lv === lv);
    if (md) rows = rows.filter(r => r.md === md);
    if (kw) rows = rows.filter(r => (r.msg || '').toLowerCase().includes(kw));
    rows = rows.slice().reverse();

    if (!rows.length) {
        box.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-sub);">暂无匹配日志</div>`;
        return;
    }
    box.innerHTML = rows.map(r => `
        <div class="log-row">
            <span class="ts">${r.ts}</span>
            <span class="md">${r.md}</span>
            <span class="lv ${r.lv}">${r.lv}</span>
            <span class="msg">${r.msg}</span>
        </div>
    `).join('');
}
window.renderLogs = renderLogs;

function clearLogs() {
    if (!confirm('确定清空全部日志吗？')) return;
    window.GlobalLogs = [];
    renderLogs();
}
window.clearLogs = clearLogs;
