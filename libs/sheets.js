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
