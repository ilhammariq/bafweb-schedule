import { teams } from "../data/team";
import { holidays } from "../data/holiday";
import { cutiDays } from "../data/cuti";

const startDate = new Date("2026-07-13");
const endDate = new Date(startDate);
endDate.setFullYear(endDate.getFullYear() + 1);

function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function shuffleWithSeed(array, seed) {
    let arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

function getHoliday(date) {
    const d = date.toISOString().split("T")[0];
    return holidays.find((h) => h.date === d);
}

function getCuti(date) {
    const d = date.toISOString().split("T")[0];

    return cutiDays
        .filter((c) => c.tanggal.includes(d))
        .map((c) => c.name);
}

export function generateSchedule() {
    let currentDate = new Date(startDate);

    let data = [];

    let teamIndex = 0;
    let pendingTeam = null;

    let cycle = 0;
    let currentShuffle = shuffleWithSeed(teams, cycle);

    while (currentDate < endDate) {
        const day = currentDate.getDay();

        if (day !== 0 && day !== 6) {
            let entry = {
                date: new Date(currentDate),
                dayName: currentDate.toLocaleDateString("id-ID", {
                    weekday: "long",
                }),
                team: "",
                cuti: [],
                isHoliday: false,
                isFull: false,
            };

            const holiday = getHoliday(currentDate);

            if (holiday) {
                entry.team = holiday.name;
                entry.isHoliday = true;

                if (pendingTeam === null) {
                    pendingTeam = currentShuffle[teamIndex % teams.length];
                }
            } else if (day === 4) {
                entry.team = "Full Team";
                entry.isFull = true;
            } else {
                let team;

                if (pendingTeam) {
                    team = pendingTeam;
                    pendingTeam = null;
                    teamIndex++;
                } else {
                    team = currentShuffle[teamIndex % teams.length];
                    teamIndex++;
                }

                entry.team = team;

                if (teamIndex % teams.length === 0) {
                    cycle++;
                    currentShuffle = shuffleWithSeed(teams, cycle);
                }
            }

            entry.cuti = getCuti(currentDate);

            data.push(entry);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
}