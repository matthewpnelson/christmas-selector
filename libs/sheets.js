import { google } from "googleapis";
export async function getNamesData() {
  try {
    const target = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      target
    );

    const sheets = google.sheets({ version: "v4", auth: jwt });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "names", // sheet name
    });

    const rows = response.data.values;
    if (rows.length) {
      return rows.map((row) => ({
        name: row[0] ? row[0] : null,
        oneAgo: row[1] ? row[1] : null,
        twoAgo: row[2] ? row[2] : null,
        threeAgo: row[3] ? row[3] : null,
        partner: row[4] ? row[4] : null,
      }));
    }
  } catch (err) {
    console.log(err);
  }
  return [];
}
export async function getKidsData() {
  try {
    const target = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      target
    );

    const sheets = google.sheets({ version: "v4", auth: jwt });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "kids", // sheet name
    });

    const rows = response.data.values;
    if (rows.length) {
      // Sibling columns are any whose header starts with "Sibling".
      // Add "Sibling Three" for a bigger family; notes in other columns are ignored.
      const siblingCols = rows[0]
        .map((header, i) => (/^sibling/i.test(header || "") ? i : -1))
        .filter((i) => i >= 0);
      return rows.map((row) => ({
        name: row[0] ? row[0] : null,
        oneAgo: row[1] ? row[1] : null,
        twoAgo: row[2] ? row[2] : null,
        siblings: siblingCols.map((i) => row[i]).filter(Boolean),
      }));
    }
  } catch (err) {
    console.log(err);
  }
  return [];
}
