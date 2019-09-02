const readline = require("readline");

const io = {
  input: process.stdin,
  output: process.stdout
};

function readLine(questionToAsk) {
  const ioInterface = readline.createInterface({ ...io });
  return new Promise(resolve => {
    ioInterface.question(questionToAsk, answer => {
      resolve(answer);
      ioInterface.close();
    });
  });
}

module.exports = readLine;
