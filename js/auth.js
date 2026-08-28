/* ===========================
   auth.js - 认证与权限系统
   4个角色: super_admin / admin / operator / viewer
   存储: localStorage
   =========================== */
(function () {
    'use strict';

    const KEY_USERS = 'sii_platform_users_v1';
    const KEY_TOKEN = 'sii_platform_token_v1';
    const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8小时

    // 角色定义
    const ROLES = {
        super_admin: { label: '超级管理员', color: '#ff5c7a', weight: 400 },
        admin:       { label: '系统管理员', color: '#ffd700', weight: 300 },
        operator:    { label: '运维人员',   color: '#00d4ff', weight: 200 },
        viewer:      { label: '访客',       color: '#7a8eb5', weight: 100 }
    };

    // 页面访问权限矩阵（最小角色权重）
    const PAGE_PERMISSION = {
        dashboard:   100, // viewer+
        integration: 200, // operator+
        chip:        200,
        devices:     200,
        algorithm:   300, // admin+
        industry:    300,
        logs:        100,
        users:       300  // admin+（动作级细分在users.js中）
    };

    // 动作权限：角色 >= 指定级别才能执行
    const ACTIONS = {
        DEVICE_ADD:      200, // 新增设备
        DEVICE_REBOOT:   200,
        INTEGRATION_RUN: 200, // 运行算法
        INDUSTRY_DEPLOY: 300, // 部署方案
        USER_CREATE:     300, // 新建用户
        USER_EDIT:       300,
        USER_DELETE:     400, // 仅超管
        SUPER_EDIT:      400, // 修改超管信息
        LOG_CLEAR:       300
    };

    // ---------- 工具函数 ----------
    async function sha256(text) {
        const buf = new TextEncoder().encode(text);
        const hash = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    function b64Encode(obj) {
        const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
        return btoa(unescape(encodeURIComponent(s))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    }
    function b64Decode(str) {
        const pad = '='.repeat((4 - str.length % 4) % 4);
        const s = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(escape(atob(s)));
    }

    // ---------- 默认账户 ----------
    async function defaultUsers() {
        return [
            {
                id: 'U001', username: 'admin', nickname: '超级管理员',
                role: 'super_admin',
                password: await sha256('Admin@123'),
                phone: '13800000001', email: 'admin@platform.com',
                dept: '平台研发部', createdAt: '2026-01-01 09:00:00', lastLogin: null,
                enabled: true, remark: '系统内置最高权限账户'
            },
            {
                id: 'U002', username: 'manager', nickname: '张经理',
                role: 'admin',
                password: await sha256('Manager@123'),
                phone: '13800000002', email: 'zhang.manager@platform.com',
                dept: '信息中心', createdAt: '2026-01-15 10:00:00', lastLogin: null,
                enabled: true, remark: '负责系统日常配置'
            },
            {
                id: 'U003', username: 'ops', nickname: '李运维',
                role: 'operator',
                password: await sha256('Ops@123'),
                phone: '13800000003', email: 'li.ops@platform.com',
                dept: '运维班组', createdAt: '2026-02-20 09:00:00', lastLogin: null,
                enabled: true, remark: '负责现场设备接入与监控'
            },
            {
                id: 'U004', username: 'guest', nickname: '访客账户',
                role: 'viewer',
                password: await sha256('Guest@123'),
                phone: '', email: 'guest@platform.com',
                dept: '合作方', createdAt: '2026-03-01 09:00:00', lastLogin: null,
                enabled: true, remark: '只读演示账号'
            }
        ];
    }

    // ---------- 用户存储 ----------
    async function initUsers() {
        if (!localStorage.getItem(KEY_USERS)) {
            const users = await defaultUsers();
            localStorage.setItem(KEY_USERS, JSON.stringify(users));
        }
    }
    function getUsers() {
        try { return JSON.parse(localStorage.getItem(KEY_USERS) || '[]'); }
        catch { return []; }
    }
    function saveUsers(users) {
        localStorage.setItem(KEY_USERS, JSON.stringify(users));
    }

    // ---------- Token 模拟JWT ----------
    // 结构: header.payload.signature (signature=SHA256(header+payload+secret))
    const SECRET = 'sii_platform_secret_key_2026_v1';
    async function signToken(payload) {
        const header = b64Encode({ alg: 'HS256', typ: 'JWT' });
        const payload64 = b64Encode(payload);
        const signature = b64Encode(await sha256(header + '.' + payload64 + '.' + SECRET));
        return header + '.' + payload64 + '.' + signature;
    }
    async function verifyToken(token) {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [h, p, s] = parts;
        const expected = b64Encode(await sha256(h + '.' + p + '.' + SECRET));
        if (expected !== s) return null;
        try {
            const payload = JSON.parse(b64Decode(p));
            if (payload.exp && payload.exp < Date.now()) return null;
            return payload;
        } catch { return null; }
    }

    // ---------- 登录/登出 ----------
    async function login(username, password) {
        if (!username || !password) return { ok: false, msg: '用户名和密码不能为空' };
        username = username.trim();
        const users = getUsers();
        const user = users.find(u => u.username === username);
        if (!user) return { ok: false, msg: '用户不存在' };
        if (!user.enabled) return { ok: false, msg: '该账户已被禁用，请联系管理员' };
        const pwdHash = await sha256(password);
        if (user.password !== pwdHash) return { ok: false, msg: '密码错误' };

        // 更新lastLogin
        const now = T.nowFull();
        user.lastLogin = now;
        const idx = users.findIndex(u => u.id === user.id);
        users[idx] = user; saveUsers(users);

        // 生成Token
        const payload = {
            uid: user.id,
            username: user.username,
            nickname: user.nickname,
            role: user.role,
            iat: Date.now(),
            exp: Date.now() + TOKEN_TTL_MS
        };
        const token = await signToken(payload);
        localStorage.setItem(KEY_TOKEN, token);
        // 写入登录日志
        pushLog('PLAT', 'SUCCESS', `用户 [${user.username}/${user.nickname}] 登录成功，角色：${ROLES[user.role].label}`);
        return { ok: true, token, user: sanitizeUser(user) };
    }
    function logout() {
        const me = Auth.currentUser();
        if (me) pushLog('PLAT', 'INFO', `用户 [${me.username}] 已退出登录`);
        localStorage.removeItem(KEY_TOKEN);
    }
    function sanitizeUser(u) {
        const o = Object.assign({}, u); delete o.password; return o;
    }

    // ---------- 当前会话 ----------
    let cachedUser = null;
    async function currentUserAsync() {
        const token = localStorage.getItem(KEY_TOKEN);
        const payload = await verifyToken(token);
        if (!payload) { cachedUser = null; return null; }
        const users = getUsers();
        const u = users.find(x => x.id === payload.uid);
        if (!u || !u.enabled) { cachedUser = null; return null; }
        cachedUser = sanitizeUser(u);
        return cachedUser;
    }
    function currentUser() {
        if (cachedUser) return cachedUser;
        const token = localStorage.getItem(KEY_TOKEN);
        if (!token) return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = JSON.parse(b64Decode(parts[1]));
            if (payload.exp && payload.exp < Date.now()) return null;
            cachedUser = {
                id: payload.uid, username: payload.username,
                nickname: payload.nickname, role: payload.role
            };
            return cachedUser;
        } catch { return null; }
    }

    // ---------- 权限检查 ----------
    function canAccessPage(pageName) {
        const me = currentUser();
        if (!me) return false;
        const min = PAGE_PERMISSION[pageName] || 0;
        if (!min) return true;
        const myWeight = (ROLES[me.role] || { weight: 0 }).weight;
        return myWeight >= min;
    }
    function canDoAction(action) {
        const me = currentUser();
        if (!me) return false;
        const min = ACTIONS[action] || 9999;
        const myWeight = (ROLES[me.role] || { weight: 0 }).weight;
        return myWeight >= min;
    }
    function roleWeight(role) { return (ROLES[role] || { weight: 0 }).weight; }
    function currentWeight() { return roleWeight((currentUser() || {}).role); }

    // ---------- 暴露到全局 ----------
    window.Auth = {
        ROLES, PAGE_PERMISSION, ACTIONS,
        initUsers, login, logout,
        currentUser, currentUserAsync,
        canAccessPage, canDoAction, roleWeight, currentWeight,
        getUsers, saveUsers, sanitizeUser,
        // for users.js
        KEY_USERS, sha256,
        _private: { TOKEN_TTL_MS, signToken, verifyToken }
    };
    window._authReady = initUsers();
})();
