import {
  PEOPLE_IMPORT_MAX_ROWS,
  PEOPLE_IMPORT_TEMPLATE_FILE_NAME,
  normaliseImportHeader,
  peopleImportColumns,
  peopleImportTemplateExample,
  type PeopleImportField,
  type RawPeopleImportRow
} from './people-import-definition';

export type ParsedPeopleWorkbook = {
  rows: Array<{ rowNumber: number; values: RawPeopleImportRow }>;
  warnings: string[];
};

function isBlankRow(cells: unknown[]): boolean {
  return cells.every((cell) => cell === null || cell === undefined || String(cell).trim() === '');
}

export async function parsePeopleWorkbook(file: File): Promise<ParsedPeopleWorkbook> {
  const { default: readXlsxFile } = await import('read-excel-file/browser');
  const sheets = await readXlsxFile(file);
  const sheet = sheets[0]?.data;

  if (!sheet?.length) throw new Error('This workbook does not contain a worksheet.');

  const headerRow = sheet[0];
  const headerMatches = new Map<PeopleImportField, number>();
  const unknownHeaders: string[] = [];

  headerRow.forEach((value, index) => {
    const header = normaliseImportHeader(value);

    if (!header) return;

    const column = peopleImportColumns.find((candidate) =>
      [candidate.header, ...candidate.aliases].some(
        (accepted) => normaliseImportHeader(accepted) === header
      )
    );

    if (!column) {
      unknownHeaders.push(String(value));

      return;
    }

    if (headerMatches.has(column.field)) {
      throw new Error(`The ${column.header} header appears more than once.`);
    }

    headerMatches.set(column.field, index);
  });

  const missingHeaders = peopleImportColumns
    .filter((column) => column.required && !headerMatches.has(column.field))
    .map((column) => column.header);

  if (missingHeaders.length) {
    throw new Error(
      `Missing required header${missingHeaders.length === 1 ? '' : 's'}: ${missingHeaders.join(', ')}.`
    );
  }

  const dataRows = sheet
    .slice(1)
    .map((cells, index) => ({ cells, rowNumber: index + 2 }))
    .filter(({ cells }) => !isBlankRow(cells));

  if (!dataRows.length) {
    throw new Error(
      'Add at least one person row below the headers, then upload the workbook again.'
    );
  }

  if (dataRows.length > PEOPLE_IMPORT_MAX_ROWS) {
    throw new Error(`This import has more than ${PEOPLE_IMPORT_MAX_ROWS} people.`);
  }

  return {
    rows: dataRows.map(({ cells, rowNumber }) => {
      const values = {} as RawPeopleImportRow;

      peopleImportColumns.forEach((column) => {
        values[column.field] = headerMatches.has(column.field)
          ? cells[headerMatches.get(column.field) ?? -1]
          : '';
      });

      return { rowNumber, values };
    }),
    warnings: unknownHeaders.length
      ? [
          `Ignored ${unknownHeaders.length} unrecognised column${unknownHeaders.length === 1 ? '' : 's'}.`
        ]
      : []
  };
}

export async function downloadPeopleImportTemplate(): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const headings = peopleImportColumns.map((column) => ({
    value: column.header,
    fontWeight: 'bold' as const
  }));
  const workbook = writeXlsxFile([headings, peopleImportTemplateExample]);

  await workbook.toFile(PEOPLE_IMPORT_TEMPLATE_FILE_NAME);
}
