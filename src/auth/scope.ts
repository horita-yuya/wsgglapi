// https://developers.google.com/identity/protocols/oauth2/scopes
export type GoogleAuth2Scope =
  `https://www.googleapis.com/auth/${GoogleSheetsApiV4}`;
type GoogleSheetsApiV4 = "spreadsheets" | "spreadsheets.readonly";
