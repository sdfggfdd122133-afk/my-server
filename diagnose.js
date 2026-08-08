const net = require('net');
const dns = require('dns');

const HOST = '159.41.78.148';
const PORTS = [22, 27017, 80, 443];

console.log(`🔍 فحص السيرفر: ${HOST}\n`);

// فحص DNS / IP
dns.lookup(HOST, (err, address) => {
  if (err) {
    console.log('❌ فشل تحليل الـ IP:', err.message);
  } else {
    console.log('✅ الـ IP صحيح شكليًا:', address);
  }
});

// فحص كل بورت
PORTS.forEach(port => {
  const socket = new net.Socket();
  const timeout = 5000;

  socket.setTimeout(timeout);

  socket.on('connect', () => {
    console.log(`✅ بورت ${port}: متصل بنجاح`);
    socket.destroy();
  });

  socket.on('timeout', () => {
    console.log(`⏱️ بورت ${port}: TimedOut (مفيش رد خالص)`);
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log(`❌ بورت ${port}: ${err.code}`);
  });

  socket.connect(port, HOST);
});
