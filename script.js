// 元素
const inputName = document.getElementById('input-name');
const inputTarget = document.getElementById('input-target');
const btnGenerate = document.getElementById('btn-generate');
const btnClear = document.getElementById('btn-clear');
const displayName = document.getElementById('display-name');
const displayTime = document.getElementById('display-time');
const qrcodeContainer = document.getElementById('qrcode');
const downloadBtn = document.getElementById('download-btn');

let qrInstance = null;
let timerId = null;
let currentUrl = '';

// 实时更新时间
function startClock() {
  if (timerId) clearInterval(timerId);
  function tick(){ displayTime.textContent = new Date().toLocaleString('zh-CN',{hour12:false}); }
  tick();
  timerId = setInterval(tick, 1000);
}
startClock();

// 生成用于二维码的通行链接（会把姓名和被访人放到 query）
function makePassUrl(name, target){
  const base = location.origin + location.pathname; // 使用当前站点
  const p = new URL(base);
  if (name) p.searchParams.set('name', name);
  if (target) p.searchParams.set('target', target);
  p.searchParams.set('t', Date.now()); // 防缓存
  return p.toString();
}

// 生成二维码并设置下载按钮
function generateQRCode(text){
  qrcodeContainer.innerHTML = '';
  qrInstance = new QRCode(qrcodeContainer, {
    text,
    width: 180,
    height: 180,
    correctLevel: QRCode.CorrectLevel.H
  });

  // 将二维码 canvas 转成图片链接（延迟一下以确保 canvas 创建完成）
  setTimeout(()=>{
    // qrcode.js 可能在内部用 table/div 或 canvas，不同库差异，尝试获取 canvas 或 img
    let img = qrcodeContainer.querySelector('img');
    if (img && img.src) {
      downloadBtn.href = img.src;
    } else {
      const canvas = qrcodeContainer.querySelector('canvas');
      if (canvas) {
        downloadBtn.href = canvas.toDataURL('image/png');
      } else {
        downloadBtn.removeAttribute('href');
      }
    }
  }, 200);
}

// 点击生成
btnGenerate.addEventListener('click', ()=>{
  const name = inputName.value.trim();
  const target = inputTarget.value.trim();
  if (!name){
    alert('请输入访客姓名');
    inputName.focus();
    return;
  }
  displayName.textContent = name;
  startClock(); // 刷新时间显示
  currentUrl = makePassUrl(name, target);
  generateQRCode(currentUrl);
  // 更新下载名
  downloadBtn.setAttribute('download', `${name}_qrcode.png`);
});

// 清除
btnClear.addEventListener('click', ()=>{
  inputName.value = '';
  inputTarget.value = '';
  displayName.textContent = '—';
  displayTime.textContent = '--:--:--';
  qrcodeContainer.innerHTML = '';
  downloadBtn.removeAttribute('href');
});

// 如果用户直接通过带 name 的 URL 访问，则自动显示
function autoFromQuery(){
  const params = new URLSearchParams(location.search);
  const name = params.get('name');
  const target = params.get('target');
  if (name){
    inputName.value = name;
    if (target) inputTarget.value = target;
    btnGenerate.click();
  }
}
autoFromQuery();