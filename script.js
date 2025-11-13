// 默认值（用于首次没有 query 时）
const DEFAULTS = {
  name: "金贤洪",
  target: "罗福斌",
  dept: "土木工程学院",
  period: "01-01 00:00 至 12-30 23:59",
  vehicle: "驾驶汽车 (闽A22A0G)",
  campus: "所有校区,"
};

// 简单工具：读 query
function q(key){ return new URLSearchParams(location.search).get(key); }

// 取输入 DOM
const inputs = {
  name: document.getElementById('f_name'),
  target: document.getElementById('f_target'),
  dept: document.getElementById('f_dept'),
  period: document.getElementById('f_period'),
  vehicle: document.getElementById('f_vehicle'),
  campus: document.getElementById('f_campus')
};

// 输出 DOM
const out = {
  name: document.getElementById('visitor-name'),
  target: document.getElementById('target-text'),
  dept: document.getElementById('dept-text'),
  period: document.getElementById('period-text'),
  vehicle: document.getElementById('vehicle-text'),
  campus: document.getElementById('campus-text'),
  qrcode: document.getElementById('qrcode')
};

let currentUrl = location.href.split('?')[0] + '?'; // 基础 url（没有参数）

/* ---------- 辅助函数 ---------- */
// 把 ArrayBuffer/TypedArray 转为 Base64 字符串
function ab2b64(buf){
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

// 把普通字符串 base64 编码（兼容 UTF-8）
function strToBase64Utf8(str){
  // 先把 UTF-8 字符串转为 Uint8Array，再 base64
  const encoder = new TextEncoder();
  return ab2b64(encoder.encode(str));
}

/* ---------- 初始化：如果 URL 有参数则先填入输入框并显示 ---------- */
function initFromQuery(){
  const name = q('name') || DEFAULTS.name;
  const target = q('target') || DEFAULTS.target;
  const dept = q('dept') || q('department') || DEFAULTS.dept;
  const period = q('period') || DEFAULTS.period;
  const vehicle = q('vehicle') || DEFAULTS.vehicle;
  const campus = q('campus') || DEFAULTS.campus;

  inputs.name.value = name;
  inputs.target.value = target;
  inputs.dept.value = dept;
  inputs.period.value = period;
  inputs.vehicle.value = vehicle;
  inputs.campus.value = campus;

  // 先渲染一次
  applyValuesToCard({name, target, dept, period, vehicle, campus});
}

/* 把值渲染到卡片并生成二维码（也会更新 URL query） */
async function applyValuesToCard(vals){
  try {
    const safe = {
      name: vals.name || DEFAULTS.name,
      target: vals.target || DEFAULTS.target,
      dept: vals.dept || DEFAULTS.dept,
      period: vals.period || DEFAULTS.period,
      vehicle: vals.vehicle || DEFAULTS.vehicle,
      campus: vals.campus || DEFAULTS.campus
    };

    out.name.textContent = safe.name;
    out.target.textContent = safe.target;
    out.dept.textContent = safe.dept;
    out.period.textContent = safe.period;
    out.vehicle.textContent = safe.vehicle;
    out.campus.textContent = safe.campus;

    // 生成带参数的 URL（方便扫码后显示同一信息）
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('name', safe.name);
    url.searchParams.set('target', safe.target);
    url.searchParams.set('dept', safe.dept);
    url.searchParams.set('period', safe.period);
    url.searchParams.set('vehicle', safe.vehicle);
    url.searchParams.set('campus', safe.campus);
    url.searchParams.set('t', Date.now());
    currentUrl = url.toString();

    // --------------- 生成 payload 并用于二维码（增加密度） ---------------
    // 生成 16 字节随机盐并转为 Base64 字符串（避免把 Uint8Array 放入 JSON）
    const randBytes = crypto.getRandomValues(new Uint8Array(16));
    const randB64 = ab2b64(randBytes.buffer);

    // payload：包含必要字段 + 随机盐 r（可删掉某些字段以更短）
    const payload = {
      n: safe.name,
      t: Date.now(),
      p: safe.period,
      d: safe.dept,
      r: randB64
    };

    // 把 payload JSON 序列化后再做 Base64（UTF-8 安全）
    const token = strToBase64Utf8(JSON.stringify(payload));

    // 可选：重复两次（你的示例也是重复两段），也可以只用 token
    const finalContent = token + token;

    // 二维码（使用 finalContent）
    makeQRCode(finalContent);

    // 同步浏览器地址栏（不刷新页面）
    history.replaceState(null, '', url.toString());
  } catch (err) {
    console.error('applyValuesToCard 出错：', err);
    alert('生成二维码时发生错误，详见控制台（F12）');
  }
}

/* 生成二维码（使用 qrcode.js） */
function makeQRCode(text){
  out.qrcode.innerHTML = '';
  new QRCode(out.qrcode, {
    text: text,
    width: 200,   // 稍微大一点，便于扫描
    height: 200,
    colorDark: "#35ae81",    // 深绿色二维码
    colorLight: "#ffffff",   // 白色背景
    correctLevel: QRCode.CorrectLevel.H
  });
  // 可以同时生成下载链接（如果需要）
}

// 表单按钮事件
document.getElementById('btn-generate').addEventListener('click', async ()=>{
  const vals = {
    name: inputs.name.value.trim(),
    target: inputs.target.value.trim(),
    dept: inputs.dept.value.trim(),
    period: inputs.period.value.trim(),
    vehicle: inputs.vehicle.value.trim(),
    campus: inputs.campus.value.trim()
  };
  // 基本校验：姓名必填
  if (!vals.name){
    alert('请填写访客姓名');
    inputs.name.focus();
    return;
  }
  await applyValuesToCard(vals);
});

// 清除按钮（恢复默认并清空 query）
document.getElementById('btn-clear').addEventListener('click', ()=>{
  inputs.name.value = '';
  inputs.target.value = '';
  inputs.dept.value = '';
  inputs.period.value = '';
  inputs.vehicle.value = '';
  inputs.campus.value = '';
  // 恢复默认显示
  applyValuesToCard(DEFAULTS);
  history.replaceState(null, '', window.location.pathname);
});

// 编辑区折叠切换
const editorEl = document.getElementById('editor');
document.getElementById('btn-toggle').addEventListener('click', ()=>{
  if (editorEl.style.display === 'none'){
    editorEl.style.display = '';
    document.getElementById('btn-toggle').textContent = '隐藏编辑区';
  } else {
    editorEl.style.display = 'none';
    document.getElementById('btn-toggle').textContent = '显示编辑区';
  }
});

// 时钟（顶部时间及日期）
function startClock(){
  const timeEl = document.getElementById('now-time');
  const dateEl = document.getElementById('now-date');
  function pad(n){ return n<10 ? '0'+n : n; }
  function tick(){
    const now = new Date();
    timeEl.textContent = `${pad(now.getHours())} : ${pad(now.getMinutes())} : ${pad(now.getSeconds())}`;
    dateEl.textContent = `${now.getFullYear()}年${pad(now.getMonth()+1)}月${pad(now.getDate())}日`;
  }
  tick();
  setInterval(tick, 1000);
}
startClock();

// 启动：优先从 URL 参数初始化
initFromQuery();
