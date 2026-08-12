export type CsvRow = Record<string, string>

function splitCsvLine(line: string) {
    const values: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i]

        if (char === '"') {
            const next = line[i + 1]
            if (inQuotes && next === '"') {
                current += '"'
                i += 1
            } else {
                inQuotes = !inQuotes
            }
            continue
        }

        if (char === "," && !inQuotes) {
            values.push(current.trim())
            current = ""
            continue
        }

        current += char
    }

    values.push(current.trim())
    return values
}

export async function parseCsvFile(file: File): Promise<CsvRow[]> {
    const text = await file.text()
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

    if (lines.length < 2) {
        return []
    }

    const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase())

    return lines.slice(1).map((line) => {
        const values = splitCsvLine(line)
        return headers.reduce<CsvRow>((row, header, index) => {
            row[header] = values[index] ?? ""
            return row
        }, {})
    })
}
