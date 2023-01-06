const childProcess = require("child_process");
const util = require('util');
const { google } = require('googleapis');
require('dotenv').config()

// Load the service account key JSON file
const key = require(`./${process.env.JSON_KEY_FILENAME}.json`);
const spreadsheetId = process.env.SPREADSHEET_ID;
const rangeCells = 'Plantilla!B1';

// Authenticate with the Google Sheets API
const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const authorize = util.promisify(jwtClient.authorize).bind(jwtClient);

async function authenticate() {
  try {
    // Authorize the API call
    await authorize();
    console.log('API authenticated');
  } catch (error) {
    console.log(error);
  }
}

authenticate();

const sheets = google.sheets({ version: 'v4', auth: jwtClient });

async function getSheetCellValue(cellRange) {
  const responseGet = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: cellRange
  });
  return responseGet.data.values;
}

function updateSheetCell(range, values) {
  sheets.spreadsheets.values.update(
    {
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',  // Interpret values as they were entered by the user
      resource: {
        values: [values]  // Update the cell with the value "New value"
      }
    }
  );
}

function execute(command) {
  return new Promise(function (resolve, reject) {
    childProcess.exec(command, function (error, standardOutput, standardError) {
      if (error) {
        reject();
        return;
      }

      if (standardError) {
        reject(standardError);
        return;
      }

      resolve(standardOutput);
    });
  });
}

async function listFiles() {
  return await execute(`cd tickets_images && ls`);
}

async function getTotalFromTicket(fileName) {
  let response = undefined;
  try {
    response = await execute(`cd tickets_images && tesseract ${fileName} - -l spa`);
    const filteredLines = response.toLowerCase().split('\n').filter(line => {
      const words = ['total'];
      return new RegExp(words.join('|')).test(line);
    });
    const total = filteredLines[0].match(/\d+/g).join('');
    return total;
  } catch (error) {
    console.log('Error executing Tesseract');
  }
}

async function main() {
  const files = await listFiles();
  // From output command, make a list with the tickets and let only images
  const tickets = files.split('\n').filter(file => {
    const words = ['png', 'jpeg'];
    return new RegExp(words.join('|')).test(file);
  });
  // Listar boletas
  tickets.forEach(async ticket => {
    // Por cada boleta obtener total
    const total = await getTotalFromTicket(ticket);
    console.log(total);
    // Print total in spreadsheet cell
    updateSheetCell(rangeCells, [total]);
  });
}

main();