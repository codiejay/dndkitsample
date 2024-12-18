import { Section } from "../types";

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2);
  return timestamp + randomStr;
}

export function findContainer(
  sections: Record<string, Section>,
  id: string
): string | undefined {
  return Object.keys(sections).find((key) =>
    sections[key].items.some((item) => item.id === id)
  );
}
