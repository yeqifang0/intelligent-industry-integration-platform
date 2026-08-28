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
        if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
            const buf = new TextEncoder().encode(text);
            const hash = await crypto.subtle.digest('SHA-256', buf);
            return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Fallback: 纯JS实现SHA-256（兼容某些无crypto.subtle的环境）
        return sha256Fallback(text);
    }

    /* ================= SHA-256 纯JS Fallback ================= */
    function sha256Fallback(str) {
        function rightRotate(n, x) { return (x >>> n) | (x << (32 - n)); }
        function ch(x, y, z) { return (x & y) ^ (~x & z); }
        function maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
        function sigma0(x) { return rightRotate(2, x) ^ rightRotate(13, x) ^ rightRotate(22, x); }
        function sigma1(x) { return rightRotate(6, x) ^ rightRotate(11, x) ^ rightRotate(25, x); }
        function gamma0(x) { return rightRotate(7, x) ^ rightRotate(18, x) ^ (x >>> 3); }
        function gamma1(x) { return rightRotate(17, x) ^ rightRotate(19, x) ^ (x >>> 10); }

        // UTF-8 encode
        var utf8 = unescape(encodeURIComponent(str));
        var n = utf8.length;
        // Padding: append 0x80 then zeros, then 64-bit length in bits
        var blocks = Math.ceil((n + 9) / 64);
        var bytes = new Uint8Array(blocks * 64);
        for (var i = 0; i < n; i++) bytes[i] = utf8.charCodeAt(i);
        bytes[n] = 0x80;
        // 64-bit big-endian bit length: n*8, split to 2x 32-bit words. Assume n*8 < 2^32 (safe)
        var view = new DataView(bytes.buffer);
        view.setUint32(bytes.length - 4, n * 8, false);

        var K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

        for (var b = 0; b < blocks; b++) {
            var W = new Uint32Array(64);
            for (var t = 0; t < 16; t++) {
                W[t] = view.getUint32(b * 64 + t * 4, false);
            }
            for (var tt = 16; tt < 64; tt++) {
                W[tt] = (gamma1(W[tt - 2]) + W[tt - 7] + gamma0(W[tt - 15]) + W[tt - 16]) | 0;
            }
            var a = H[0], b_ = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (var ttt = 0; ttt < 64; ttt++) {
                var T1 = (h + sigma1(e) + ch(e, f, g) + K[ttt] + W[ttt]) | 0;
                var T2 = (sigma0(a) + maj(a, b_, c)) | 0;
                h = g; g = f; f = e;
                e = (d + T1) | 0;
                d = c; c = b_; b_ = a;
                a = (T1 + T2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b_) | 0;
            H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        var hex = '';
        for (var ii = 0; ii < 8; ii++) {
            hex += (H[ii] >>> 0).toString(16).padStart(8, '0');
        }
        return hex;
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
    function genUid() {
        return 'U' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
    }
    function T_nowFull(d) {
        d = d || new Date();
        const p = n => String(n).padStart(2,'0');
        return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) +
            ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }
    async function defaultUsers() {
        return [
            {
                id: 'U001', username: 'admin', nickname: '超级管理员',
                role: 'super_admin',
                password: await sha256('Admin@123'),
                phone: '13800000001', email: 'admin@platform.com',
                dept: '平台研发部', createdAt: '2026-01-01 09:00:00', lastLogin: null,
                enabled: true, remark: '系统内置最高权限账户', source: 'seed'
            },
            {
                id: 'U002', username: 'manager', nickname: '张经理',
                role: 'admin',
                password: await sha256('Manager@123'),
                phone: '13800000002', email: 'zhang.manager@platform.com',
                dept: '信息中心', createdAt: '2026-01-15 10:00:00', lastLogin: null,
                enabled: true, remark: '负责系统日常配置', source: 'seed'
            },
            {
                id: 'U003', username: 'ops', nickname: '李运维',
                role: 'operator',
                password: await sha256('Ops@123'),
                phone: '13800000003', email: 'li.ops@platform.com',
                dept: '运维班组', createdAt: '2026-02-20 09:00:00', lastLogin: null,
                enabled: true, remark: '负责现场设备接入与监控', source: 'seed'
            },
            {
                id: 'U004', username: 'guest', nickname: '访客账户',
                role: 'viewer',
                password: await sha256('Guest@123'),
                phone: '', email: 'guest@platform.com',
                dept: '合作方', createdAt: '2026-03-01 09:00:00', lastLogin: null,
                enabled: true, remark: '只读演示账号', source: 'seed'
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

    // ---------- 密码强度校验 ----------
    function validatePasswordStrength(pwd) {
        if (!pwd || pwd.length < 6) return { ok: false, msg: '密码长度至少6位' };
        if (!/[A-Za-z]/.test(pwd)) return { ok: false, msg: '密码必须包含字母' };
        if (!/[0-9]/.test(pwd)) return { ok: false, msg: '密码必须包含数字' };
        if (pwd.length > 32) return { ok: false, msg: '密码长度不能超过32位' };
        return { ok: true };
    }
    const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_REGEX = /^1[3-9][0-9]{9}$/;

    // ---------- 注册 ----------
    async function register({ username, nickname, password, password2, email, phone, dept }) {
        // 字段非空
        if (!username) return { ok: false, field: 'username', msg: '请输入登录名' };
        if (!nickname) return { ok: false, field: 'nickname', msg: '请输入显示名' };
        if (!password) return { ok: false, field: 'password', msg: '请输入密码' };

        username = String(username).trim();
        nickname = String(nickname).trim();
        email = email ? String(email).trim() : '';
        phone = phone ? String(phone).trim() : '';
        dept = dept ? String(dept).trim() : '';

        // 格式校验
        if (!USERNAME_REGEX.test(username)) {
            return { ok: false, field: 'username', msg: '登录名仅允许3-20位字母、数字或下划线' };
        }
        if (nickname.length < 1 || nickname.length > 30) {
            return { ok: false, field: 'nickname', msg: '显示名长度为1-30字符' };
        }
        const pwdOk = validatePasswordStrength(password);
        if (!pwdOk.ok) return { ok: false, field: 'password', msg: pwdOk.msg };
        if (password !== password2) {
            return { ok: false, field: 'password2', msg: '两次输入的密码不一致' };
        }
        if (email && !EMAIL_REGEX.test(email)) {
            return { ok: false, field: 'email', msg: '邮箱格式不正确' };
        }
        if (phone && !PHONE_REGEX.test(phone)) {
            return { ok: false, field: 'phone', msg: '请输入正确的11位手机号' };
        }

        // 唯一性校验
        const users = getUsers();
        if (users.some(u => (u.username || '').toLowerCase() === username.toLowerCase())) {
            return { ok: false, field: 'username', msg: '该登录名已被注册，请更换' };
        }
        if (email && users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
            return { ok: false, field: 'email', msg: '该邮箱已被其他账号使用' };
        }
        if (phone && users.some(u => u.phone === phone)) {
            return { ok: false, field: 'phone', msg: '该手机号已被其他账号使用' };
        }

        // 安全：新注册账号默认 viewer 角色
        const nowStr = (window.T && T.nowFull) ? T.nowFull() : T_nowFull();
        const newUser = {
            id: genUid(),
            username,
            nickname,
            role: 'viewer',
            password: await sha256(password),
            phone, email, dept,
            createdAt: nowStr,
            lastLogin: null,
            enabled: true,
            remark: '用户自助注册',
            source: 'registered'
        };
        users.push(newUser);
        saveUsers(users);
        pushLog('PLAT', 'SUCCESS', `新用户注册成功：[${username}/${nickname}]，分配角色：访客(viewer)，来源：自助注册`);
        return { ok: true, user: sanitizeUser(newUser) };
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
        initUsers, login, logout, register,
        validatePasswordStrength,
        USERNAME_REGEX, EMAIL_REGEX, PHONE_REGEX,
        currentUser, currentUserAsync,
        canAccessPage, canDoAction, roleWeight, currentWeight,
        getUsers, saveUsers, sanitizeUser, genUid,
        // for users.js
        KEY_USERS, sha256,
        _private: { TOKEN_TTL_MS, signToken, verifyToken }
    };
    window._authReady = initUsers();
})();
