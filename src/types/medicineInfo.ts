export type MedicineInfoBlock = {
  text: string;
  bullet?: boolean;
  bold?: boolean;
};

export type MedicineInfoSection = {
  title: string;
  blocks: MedicineInfoBlock[];
};

export function parseMedicineInfoSections(
  value: unknown,
): MedicineInfoSection[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const sections: MedicineInfoSection[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const section = item as Record<string, unknown>;
    if (typeof section.title !== 'string' || !Array.isArray(section.blocks)) {
      continue;
    }
    const blocks: MedicineInfoBlock[] = [];
    for (const block of section.blocks) {
      if (!block || typeof block !== 'object') {
        continue;
      }
      const row = block as Record<string, unknown>;
      if (typeof row.text !== 'string' || !row.text.trim()) {
        continue;
      }
      blocks.push({
        text: row.text,
        bullet: row.bullet === true,
        bold: row.bold === true,
      });
    }
    if (blocks.length) {
      sections.push({title: section.title, blocks});
    }
  }

  return sections.length ? sections : null;
}
