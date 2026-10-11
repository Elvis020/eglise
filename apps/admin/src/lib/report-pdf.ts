import type { Person } from './domain';
import type { AttendanceReport } from './reports';

export function reportLines(report: AttendanceReport, people: Person[]): string[] {
  const names = new Map(people.map((person) => [person.id, person.name]));

  return [
    `Number of events: ${report.events.length}`,
    `Total attendance (distinct people): ${report.distinctPeople}`,
    `Individual check-ins: ${report.individualCheckIns}`,
    `Manual headcounts: ${report.manualHeadcountTotal} (separate; do not add to check-ins)`,
    'Open events are included and labelled. Their attendance may change.',
    '',
    ...report.events.flatMap((event) => [
      `${event.label} — ${event.date} ${event.startsAt} — ${event.status === 'open' ? 'Open' : 'Complete'}`,
      `Check-ins: ${event.attendeeIds.length} | Manual headcount: ${event.manualHeadcount ?? 'Not recorded'}`,
      ...event.attendeeIds.map((id) => `  • ${names.get(id) ?? 'Person record unavailable'}`),
      ...(event.attendeeIds.length ? [] : ['  No individual attendees recorded.']),
      ''
    ])
  ];
}

// Raster pages preserve Unicode names visually without a font dependency.
// The accessible, selectable source remains the HTML report.
export function downloadAttendancePdf(report: AttendanceReport, people: Person[]): void {
  const canvas = document.createElement('canvas');

  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('PDF export is unavailable in this browser.');
  context.font = '26px sans-serif';
  const lines: string[] = [];

  for (const line of reportLines(report, people)) {
    let current = '';

    for (const character of line) {
      if (context.measureText(current + character).width > 1080) {
        lines.push(current);
        current = '';
      }
      current += character;
    }
    lines.push(current);
  }

  const perPage = 36;
  const images: Uint8Array[] = [];
  const count = Math.max(1, Math.ceil(lines.length / perPage));

  for (let index = 0; index < count; index += 1) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#24271f';
    context.font = 'bold 38px sans-serif';
    context.fillText('Eglise · Attendance report', 80, 90);
    context.font = '26px sans-serif';
    context.fillText(report.label, 80, 138);
    lines
      .slice(index * perPage, (index + 1) * perPage)
      .forEach((line, row) => context.fillText(line, 80, 220 + row * 39));
    context.fillText(`Page ${index + 1} of ${count}`, 80, 1680);
    const binary = atob(canvas.toDataURL('image/jpeg', 0.92).split(',')[1]);

    images.push(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
  }

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;

  function append(value: string | Uint8Array): void {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;

    chunks.push(bytes);
    length += bytes.length;
  }

  function object(id: number, body: string, stream?: Uint8Array): void {
    offsets[id] = length;
    append(`${id} 0 obj\n${body}\n`);
    if (stream) {
      append('stream\n');
      append(stream);
      append('\nendstream\n');
    }
    append('endobj\n');
  }

  append('%PDF-1.4\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(
    2,
    `<< /Type /Pages /Count ${count} /Kids [${images.map((_, index) => `${3 + index * 3} 0 R`).join(' ')}] >>`
  );
  images.forEach((bytes, index) => {
    const id = 3 + index * 3;
    const commands = encoder.encode('q 595 0 0 842 0 0 cm /Image Do Q');

    object(
      id,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Image ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`
    );
    object(
      id + 1,
      `<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>`,
      bytes
    );
    object(id + 2, `<< /Length ${commands.length} >>`, commands);
  });
  const xref = length;

  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => append(`${String(offset).padStart(10, '0')} 00000 n \n`));
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const output = new Uint8Array(length);
  let position = 0;

  for (const chunk of chunks) {
    output.set(chunk, position);
    position += chunk.length;
  }
  const url = URL.createObjectURL(new Blob([output], { type: 'application/pdf' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = `attendance-${report.start}-${report.end}.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
