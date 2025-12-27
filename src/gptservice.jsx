export function generateMCQs(subject) {
  return Array.from({ length: 10 }).map((_, i) => ({
    question: `Question ${i + 1} about ${subject}?`,
    options: ["A", "B", "C", "D"]
  }));
}
