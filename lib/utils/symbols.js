var symbols = {
  ok: '\u2713',
  err: '\u2717'
};

// win32 console default output fonts don't support tick/cross
if (process && process.platform === 'win32') {
  symbols = {
    ok: '\u221A',
    err: '\u00D7'
  };
}

module.exports = symbols;