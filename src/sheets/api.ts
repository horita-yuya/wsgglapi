// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get

import type { SheetRange } from "./types";

const url = "https://sheets.googleapis.com/v4/spreadsheets";

export async function getSpreadsheetValues(
  {
    spreadsheetId,
    sheet,
    range,
  }: { spreadsheetId: string; sheet: string; range: SheetRange },
  init?: RequestInit,
): Promise<{ range: string; values: string[][] }> {
  const value = `${sheet}!${range}`;
  const response = await fetch(`${url}/${spreadsheetId}/values/${value}`, init);
  return await response.json();
}
