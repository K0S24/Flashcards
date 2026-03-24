import type { Card } from '../hooks/useCards'

export function exportDeckAsCSV(deckName: string, cards: Card[]): void {
  const header = 'question,answer'
  const rows = cards.map(c => `"${c.question.replace(/"/g, '""')}","${c.answer.replace(/"/g, '""')}"`)
  const csv = [header, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${deckName}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function parseCSV(text: string): { question: string; answer: string }[] {
  const lines = text.trim().split('\n')
  const results: { question: string; answer: string }[] = []

  // Header überspringen falls vorhanden
  const start = lines[0].toLowerCase().includes('question') ? 1 : 0

  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // CSV Parsing mit Anführungszeichen
    const match = line.match(/^"?(.*?)"?,\s*"?(.*?)"?$/)
    if (match) {
      const question = match[1].replace(/""/g, '"').trim()
      const answer = match[2].replace(/""/g, '"').trim()
      if (question && answer) results.push({ question, answer })
    }
  }

  return results
}