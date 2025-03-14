declare module "xlsx" {
  interface Utils {
    aoa_to_sheet(data: any[][]): any;
    book_new(): any;
    book_append_sheet(workbook: any, worksheet: any, name: string): void;
  }

  interface XLSX {
    utils: Utils;
    writeFile(workbook: any, filename: string): void;
  }

  const XLSX: XLSX;
  export = XLSX;
}
