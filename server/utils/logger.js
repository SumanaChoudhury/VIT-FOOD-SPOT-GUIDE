function info(msg, meta = '') {
  console.log(`[INFO ${new Date().toISOString()}] ${msg}`, meta);
}

function warn(msg, meta = '') {
  console.warn(`[WARN ${new Date().toISOString()}] ${msg}`, meta);
}

function error(msg, err = '') {
  console.error(`[ERROR ${new Date().toISOString()}] ${msg}`, err);
}

module.exports = {
  info,
  warn,
  error
};
