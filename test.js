module.exports = {
  benchmarkFunction() {
    for (let i = 0; i < Math.pow(10, 6); i++);
  },
  options: {
    runs: 1000,
    loops: 50,
  },
}
