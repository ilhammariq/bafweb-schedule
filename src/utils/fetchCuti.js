const CSV_URL = process.env.NEXT_PUBLIC_CUTI_URL_API;

// Terima "yyyy-mm-dd" atau "m/d/yyyy" (locale US), hasil selalu "yyyy-mm-dd"
const normalizeDate = (value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const [, month, day, year] = m;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return null;
};

// Pecah satu baris, mendukung pemisah koma/tab dan sel bertanda kutip
const parseLine = (line, delimiter) => {
    const cells = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === delimiter && !inQuotes) {
            cells.push(cur.trim());
            cur = "";
        } else {
            cur += ch;
        }
    }
    cells.push(cur.trim());
    return cells;
};

/**
 * Format sheet: header = nama member, tiap kolom berisi tanggal cuti.
 * Return: [{ date: "2026-10-09", name: "Arif" }, ...]
 */
export async function fetchCutiDays() {
    const res = await fetch(CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal mengambil data cuti");

    const text = (await res.text()).replace(/^\uFEFF/, "");
    const [headerLine, ...lines] = text.trim().split(/\r?\n/);

    const delimiter = headerLine.includes("\t") ? "\t" : ",";
    const names = parseLine(headerLine, delimiter);

    const result = [];
    lines.forEach((line) => {
        parseLine(line, delimiter).forEach((cell, colIndex) => {
            const name = names[colIndex];
            const date = normalizeDate(cell);
            if (name && date) result.push({ date, name });
        });
    });

    console.log("cutiDays:", result); // hapus kalau sudah beres
    return result;
}