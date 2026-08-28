/* ===========================
   users.js - 用户管理模块
   =========================== */

window.init_users = async function () {
    if (!(await guardPage('users'))) return;
    renderUserList();
};

function guardPage(pg) {
    return new Promise(resolve => {
        const me = Auth.currentUser();
        if (!me) { showLogin(); resolve(false); return; }
        if (!Auth.canAccessPage(pg)) {
            alert('⚠ 权限不足\n\n当前角色：' + Auth.ROLES[me.role].label + '\n无法访问此模块，请联系管理员升级权限。');
            document.querySelector('.menu-item[data-page="dashboard"]').click();
            resolve(false); return;
        }
        resolve(true);
    });
}
window._guardPage = guardPage;

function renderUserList() {
    const users = Auth.getUsers();
    const me = Auth.currentUser();
    const canCreate = Auth.canDoAction('USER_CREATE');
    const canDelete = Auth.canDoAction('USER_DELETE');
    const canSuperEdit = Auth.canDoAction('SUPER_EDIT');

    document.getElementById('userCountTotal').textContent = users.length;
    document.getElementById('userCountEnabled').textContent = users.filter(u => u.enabled).length;
    document.getElementById('userCountAdmin').textContent = users.filter(u => Auth.roleWeight(u.role) >= 300).length;
    document.getElementById('userCountOnline').textContent = me ? 1 : 0;

    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = users.map(u => {
        const roleMeta = Auth.ROLES[u.role] || { label: u.role, color: '#999' };
        const isSelf = me && me.id === u.id;
        const isSuper = u.role === 'super_admin';
        const canEditThis = (
            Auth.canDoAction('USER_EDIT') &&
            (!isSuper || canSuperEdit)
        );
        const canDelThis = canDelete && !isSelf && (!isSuper || canSuperEdit);
        return `
            <tr>
                <td><div class="usr-avatar" style="background:linear-gradient(135deg, ${roleMeta.color}55, ${roleMeta.color}22);color:${roleMeta.color}">${u.nickname.charAt(0)}</div></td>
                <td>
                    <div style="font-weight:600;color:#fff;">${u.nickname}${isSelf ? ' <span class="dev-proto-tag" style="background:rgba(0,255,136,0.15);color:#00ff88;">我</span>' : ''}</div>
                    <div style="font-size:11px;color:var(--text-dim);font-family:Consolas;">${u.username}</div>
                </td>
                <td><span class="role-pill" style="background:${roleMeta.color}22;color:${roleMeta.color};border:1px solid ${roleMeta.color}55">${roleMeta.label}</span></td>
                <td style="font-size:12px;">${u.dept || '-'}</td>
                <td style="font-size:11px;font-family:Consolas;color:var(--text-sub);">${u.email || '-'}</td>
                <td><span class="status-pill ${u.enabled ? 'success' : 'warning'}">${u.enabled ? '启用' : '禁用'}</span></td>
                <td style="font-size:11px;font-family:Consolas;color:var(--text-sub);">${u.lastLogin || '<span style="color:var(--text-dim)">从未登录</span>'}</td>
                <td style="font-size:11px;font-family:Consolas;color:var(--text-dim);">${(u.createdAt || '').slice(0, 10)}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        ${canEditThis ? `<button class="btn btn-outline" style="padding:3px 8px;font-size:11px;" onclick="editUser('${u.id}')">编辑</button>` : ''}
                        <button class="btn btn-outline" style="padding:3px 8px;font-size:11px;" onclick="resetPwd('${u.id}')">重置密码</button>
                        ${canDelThis ? `<button class="btn btn-outline" style="padding:3px 8px;font-size:11px;color:var(--danger);border-color:rgba(255,92,122,0.4);" onclick="delUser('${u.id}')">删除</button>` : ''}
                    </div>
                </td>
            </tr>`;
    }).join('');

    // 顶部新建按钮权限
    const addBtn = document.getElementById('addUserBtn');
    if (addBtn) addBtn.style.display = canCreate ? '' : 'none';
}

/* ---------- 新建/编辑用户弹窗 ---------- */
let editingUserId = null;
function openUserModal(uid) {
    editingUserId = uid || null;
    const users = Auth.getUsers();
    const u = uid ? users.find(x => x.id === uid) : null;
    const me = Auth.currentUser();

    const title = document.getElementById('userModalTitle');
    title.textContent = u ? '编辑用户' : '新建用户';

    // 角色选项：禁止新建超级管理员（除非自己是超管）
    const canCreateSuper = Auth.canDoAction('SUPER_EDIT');
    const roleOptions = Object.entries(Auth.ROLES)
        .filter(([code]) => code !== 'super_admin' || canCreateSuper)
        .map(([code, meta]) => `<option value="${code}" ${u && u.role === code ? 'selected' : ''}>${meta.label}</option>`)
        .join('');

    document.getElementById('userForm').innerHTML = `
        <div class="info-grid" style="grid-template-columns:1fr 1fr;">
            <div class="info-group">
                <div class="info-group-title">基础信息</div>
                <div class="info-row"><span class="k">登录名 *</span><span class="v"><input class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_username" ${u ? 'disabled' : ''} value="${u ? u.username : ''}" placeholder="3-20位字符"></span></div>
                <div class="info-row"><span class="k">显示名 *</span><span class="v"><input class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_nickname" value="${u ? u.nickname : ''}"></span></div>
                ${u ? '' : `<div class="info-row"><span class="k">初始密码 *</span><span class="v"><input type="password" class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_password" placeholder="≥6位 含字母数字"></span></div>
                <div class="info-row"><span class="k">密码确认 *</span><span class="v"><input type="password" class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_password2" placeholder="再次输入"></span></div>`}
                <div class="info-row"><span class="k">角色 *</span><span class="v"><select class="filter-select" style="width:100%;padding:5px 8px;font-size:12px;" id="f_role">${roleOptions}</select></span></div>
            </div>
            <div class="info-group">
                <div class="info-group-title">联系信息</div>
                <div class="info-row"><span class="k">所属部门</span><span class="v"><input class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_dept" value="${u ? (u.dept || '') : ''}"></span></div>
                <div class="info-row"><span class="k">手机号</span><span class="v"><input class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_phone" value="${u ? (u.phone || '') : ''}"></span></div>
                <div class="info-row"><span class="k">邮箱</span><span class="v"><input class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_email" value="${u ? (u.email || '') : ''}"></span></div>
                <div class="info-row"><span class="k">启用状态</span><span class="v" style="padding-top:2px;"><label class="switch-label" style="margin:0;padding:3px 10px;"><input type="checkbox" id="f_enabled" ${u ? (u.enabled ? 'checked' : '') : 'checked'}> 启用此账户</label></span></div>
                <div class="info-row"><span class="k">备注</span><span class="v"><input class="search-input" style="width:100%;padding:5px 8px;font-size:12px;" id="f_remark" value="${u ? (u.remark || '') : ''}"></span></div>
            </div>
        </div>
    `;
    document.getElementById('userModal').classList.add('show');
}
window.editUser = function(uid) { openUserModal(uid); };
window.newUser = function() { openUserModal(null); };

async function saveUserModal() {
    const users = Auth.getUsers();
    const get = id => (document.getElementById(id) || {}).value || '';
    const username = get('f_username').trim();
    const nickname = get('f_nickname').trim();
    const role = get('f_role');
    const enabled = document.getElementById('f_enabled').checked;
    if (!username || username.length < 3) return alert('⚠ 登录名长度至少3位');
    if (!nickname) return alert('⚠ 显示名不能为空');

    if (editingUserId) {
        // 编辑
        const canSuperEdit = Auth.canDoAction('SUPER_EDIT');
        const idx = users.findIndex(u => u.id === editingUserId);
        if (idx < 0) return alert('用户不存在');
        const orig = users[idx];
        if (orig.role === 'super_admin' && role !== 'super_admin' && !canSuperEdit)
            return alert('⚠ 只有超级管理员能修改超管角色');

        users[idx] = Object.assign({}, orig, { nickname, role, enabled,
            dept: get('f_dept'), phone: get('f_phone'), email: get('f_email'),
            remark: get('f_remark') });
        pushLog('PLAT', 'SUCCESS', `编辑用户 [${username}] 成功，新角色: ${Auth.ROLES[role].label}`);
    } else {
        // 新建
        if (users.some(u => u.username === username)) return alert('⚠ 登录名已存在');
        const p1 = get('f_password'); const p2 = get('f_password2');
        if (!p1 || p1.length < 6) return alert('⚠ 密码长度至少6位');
        if (p1 !== p2) return alert('⚠ 两次输入的密码不一致');
        if (!/[a-zA-Z]/.test(p1) || !/[0-9]/.test(p1)) return alert('⚠ 密码必须包含字母和数字');
        if (role === 'super_admin' && !Auth.canDoAction('SUPER_EDIT'))
            return alert('⚠ 只有超级管理员能创建超管账户');

        const newId = 'U' + String(users.length + 1).padStart(3, '0') + '_' + Date.now().toString().slice(-4);
        const hashed = await Auth.sha256(p1);
        users.push({
            id: newId, username, nickname, role, password: hashed, enabled,
            dept: get('f_dept'), phone: get('f_phone'), email: get('f_email'),
            remark: get('f_remark'), createdAt: T.nowFull(), lastLogin: null
        });
        pushLog('PLAT', 'SUCCESS', `新建用户 [${username}/${nickname}] 成功，角色: ${Auth.ROLES[role].label}`);
    }
    Auth.saveUsers(users);
    renderUserList();
    closeUserModal();
}
window.saveUserModal = saveUserModal;

function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
    editingUserId = null;
}
window.closeUserModal = closeUserModal;

/* ---------- 重置密码 ---------- */
async function resetPwd(uid) {
    const users = Auth.getUsers();
    const u = users.find(x => x.id === uid);
    if (!u) return;
    const me = Auth.currentUser();
    if (u.role === 'super_admin' && !Auth.canDoAction('SUPER_EDIT') && me.id !== uid)
        return alert('⚠ 只有超级管理员能重置超管密码');

    const newPwd = prompt(`请为用户 [${u.username} / ${u.nickname}] 输入新密码（≥6位，含字母+数字）:`, 'Platform@123');
    if (newPwd === null) return;
    if (newPwd.length < 6) return alert('密码至少6位');
    if (!/[a-zA-Z]/.test(newPwd) || !/[0-9]/.test(newPwd)) return alert('密码需包含字母和数字');

    const idx = users.findIndex(x => x.id === uid);
    users[idx].password = await Auth.sha256(newPwd);
    Auth.saveUsers(users);
    pushLog('PLAT', 'WARN', `管理员重置了用户 [${u.username}] 的登录密码`);
    alert(`✅ 密码重置成功\n\n新密码：${newPwd}\n请尽快告知用户修改。`);
}
window.resetPwd = resetPwd;

/* ---------- 删除用户 ---------- */
function delUser(uid) {
    const users = Auth.getUsers();
    const u = users.find(x => x.id === uid);
    const me = Auth.currentUser();
    if (!u) return;
    if (u.id === me.id) return alert('⚠ 不能删除当前登录账户');
    if (u.role === 'super_admin' && !Auth.canDoAction('SUPER_EDIT'))
        return alert('⚠ 只有超级管理员能删除超管账户');
    if (!confirm(`确认删除用户？\n\n${u.username} / ${u.nickname}\n\n此操作不可撤销`)) return;
    const next = users.filter(x => x.id !== uid);
    Auth.saveUsers(next);
    pushLog('PLAT', 'WARN', `删除用户 [${u.username} / ${u.nickname}] 成功`);
    renderUserList();
}
window.delUser = delUser;
