export function exportICS(data, member) {
    let ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "CALSCALE:GREGORIAN",
        "PRODID:-//WFO Schedule//ID",
    ];

    data.forEach((item) => {
        if (item.isHoliday) return;

        if (!item.isFull && item.member !== member) return;

        const ymd = item.date
            .toISOString()
            .split("T")[0]
            .replace(/-/g, "");

        ics.push(
            "BEGIN:VEVENT",
            `UID:${ymd}-${item.member}@wfo`,
            `DTSTART;VALUE=DATE:${ymd}`,
            `DTEND;VALUE=DATE:${ymd}`,
            `SUMMARY:WFO ${item.isFull && "TEAM "} ${item.team}`,
            "END:VEVENT"
        );
    });

    ics.push("END:VCALENDAR");

    const blob = new Blob([ics.join("\r\n")], {
        type: "text/calendar",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wfo-${member}.ics`;
    a.click();
}