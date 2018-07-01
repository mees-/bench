module.exports = {
  benchmarkFunction() {
    for (let i = 0; i < Math.pow(10, 6); i++);
  },
  options: {
    runs: 420,
    loops: 50,
  },
}
