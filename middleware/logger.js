const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');


const logEvents = async ( message, logFilename ) => {
  const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss'); 
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`; 
  //  \t to export to excel for easy reading
  //  \n to create a new line
  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
    }
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFilename), logItem);
  } catch (err) {
    console.log(err);
    console.error('Error writing to log file' + err);
  }
}

const logger = (req, res, next) => {
  logEvents(`Request received: ${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log'); 
  console.log(`${req.method} ${req.path}`);
  next();
}

module.exports = {logEvents, logger};