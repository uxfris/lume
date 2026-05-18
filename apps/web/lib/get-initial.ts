export function getInitial(name?: string | null): string {
  if (name) {
    return name.trim().charAt(0).toUpperCase() || "L"
  }
  return "L"
}
