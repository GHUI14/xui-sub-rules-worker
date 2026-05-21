export function stringifyYaml(value: unknown): string {
  return `${writeValue(value, 0)}\n`;
}

function writeValue(value: unknown, indent: number): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value.map((item) => writeArrayItem(item, indent)).join("\n");
  }
  if (isObject(value)) {
    const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
    if (entries.length === 0) return "{}";
    return entries.map(([key, entryValue]) => writeObjectEntry(key, entryValue, indent)).join("\n");
  }
  return writeScalar(value);
}

function writeArrayItem(value: unknown, indent: number): string {
  const spaces = " ".repeat(indent);
  if (Array.isArray(value)) {
    return `${spaces}- ${value.length === 0 ? "[]" : `\n${writeValue(value, indent + 2)}`}`;
  }
  if (isObject(value)) {
    const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
    if (entries.length === 0) return `${spaces}- {}`;
    const [firstKey, firstValue] = entries[0];
    const first = `${spaces}- ${firstKey}: ${isCollection(firstValue) ? `\n${writeValue(firstValue, indent + 2)}` : writeScalar(firstValue)}`;
    const rest = entries.slice(1).map(([key, entryValue]) => writeObjectEntry(key, entryValue, indent + 2));
    return [first, ...rest].join("\n");
  }
  return `${spaces}- ${writeScalar(value)}`;
}

function writeObjectEntry(key: string, value: unknown, indent: number): string {
  const spaces = " ".repeat(indent);
  if (isCollection(value)) return `${spaces}${key}: ${Array.isArray(value) && value.length === 0 ? "[]" : `\n${writeValue(value, indent + 2)}`}`;
  return `${spaces}${key}: ${writeScalar(value)}`;
}

function writeScalar(value: unknown): string {
  if (value == null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = String(value);
  if (text === "") return '""';
  if (/^[A-Za-z0-9_./:@-]+$/.test(text) && !/^(true|false|null|yes|no|on|off)$/i.test(text)) return text;
  return JSON.stringify(text);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCollection(value: unknown): boolean {
  return Array.isArray(value) || isObject(value);
}
