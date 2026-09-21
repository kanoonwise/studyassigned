import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_SIZE: [number, number] = [595.28, 841.89]; // A4 in points
const MARGIN = 56;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;

/** Renders plain text lines to a simple single-column PDF, wrapping long lines. */
export async function renderTextPdf(lines: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_SIZE[0] - MARGIN * 2;

  let page = doc.addPage(PAGE_SIZE);
  let y = PAGE_SIZE[1] - MARGIN;

  function newPageIfNeeded() {
    if (y < MARGIN) {
      page = doc.addPage(PAGE_SIZE);
      y = PAGE_SIZE[1] - MARGIN;
    }
  }

  for (const [index, raw] of lines.entries()) {
    const isTitle = index === 0;
    const useFont = isTitle ? bold : font;
    const size = isTitle ? FONT_SIZE + 4 : FONT_SIZE;
    const wrapped = wrapLine(raw, useFont, size, maxWidth);
    for (const part of wrapped) {
      newPageIfNeeded();
      page.drawText(part, { x: MARGIN, y, size, font: useFont, color: rgb(0.1, 0.1, 0.1) });
      y -= LINE_HEIGHT;
    }
  }

  return doc.save();
}

function wrapLine(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  size: number,
  maxWidth: number,
): string[] {
  if (text === "") return [""];
  const words = text.split(" ");
  const result: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      result.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) result.push(current);
  return result;
}
