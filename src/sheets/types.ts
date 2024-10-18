// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet

export type Spreadsheet = {
  spreadsheetId: string;
  sheets: Sheet[];
};

type SpreadsheetProperties = {
  title: string;
  timeZone: string;
};

export type SheetRowData = {
  values: Array<{
    userEnteredValue?:
      | { stringValue: string }
      | { numberValue: string }
      | { formulaValue: string };
    effectiveValue?:
      | { stringValue: string; numberValue?: never }
      | { numberValue: string; stringValue?: never };
    formattedValue?: string;
    userEnteredFormat:
      | {
          backgroundColor:
            | { red: number; green: number; blue: number }
            | undefined;
        }
      | undefined;
  }>;
};

export type Sheet = {
  sheetId: number;
  title: string;
  index: number;
  data: Array<{
    rowData: Array<SheetRowData>;
  }>;
} & SheetGrid;

type SheetGrid = {
  sheetType: "GRID";
  gridProperties: SheetTypeGridProperties;
};

type SheetTypeGridProperties = {
  rowCount: number;
  columnCount: number;
};

type Alphabet =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";
type SheetCell = `${Alphabet}${number}`;
export type SheetRange = `${SheetCell}:${SheetCell}`;
