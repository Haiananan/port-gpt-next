declare module "xlsx/xlsx.mjs" {
  export interface Utils {
    json_to_sheet<T>(data: T[], opts?: any): any;
    book_new(): any;
    book_append_sheet(wb: any, ws: any, name?: string): void;
    sheet_to_json<T>(worksheet: any, opts?: any): T[];
  }

  export interface Workbook {
    SheetNames: string[];
    Sheets: {
      [key: string]: any;
    };
  }

  export const utils: Utils;
  export function read(data: string | ArrayBuffer, opts?: any): Workbook;
  export function writeFile(wb: any, filename: string): void;
}
