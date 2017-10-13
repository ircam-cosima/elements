import fse  from 'fs-extra';
import path from 'path';

function padLeft(str, value, length) {
  str = str + '';
  while (str.length < length) { str = value + str; }
  return str;
}

function getFilePath() {
  const now = new Date();
  const year = padLeft(now.getFullYear(), 0, 4);
  const month = padLeft(now.getMonth() + 1, 0, 2);
  const day = padLeft(now.getDate(), 0, 2);
  const filename = `input-data-errors-${year}${month}${day}.log`;
  return path.join(process.cwd(), filename);
}

function getFormattedDate() {
  const now = new Date();
  const year = padLeft(now.getFullYear(), 0, 4);
  const month = padLeft(now.getMonth() + 1, 0, 2);
  const day = padLeft(now.getDate(), 0, 2);
  const hour = padLeft(now.getHours(), 0, 2);
  const minutes = padLeft(now.getMinutes(), 0, 2);
  const seconds = padLeft(now.getSeconds(), 0, 2);
  // prepare file name
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}


const errorLogger = {
  append: (msg, data, client) => {
    let entry = `${getFormattedDate()}\n`;
    entry += `Project: ${client.project.name} - Client: ${client.uuid} (${client.type})\n`;
    entry += `${msg} : ${JSON.stringify(data)}\n\n`;

    fse.appendFile(getFilePath(), entry, (err) => {
      if (err)
        console.error(err.message);
    });
  },
}

export default errorLogger;
