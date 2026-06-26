import { useEffect, useMemo, useState } from "react";
import { generateSchedule } from "../utils/schedule";
import { exportICS } from "../utils/exportICS";
import { teamMember } from "../data/team";

export default function Home() {
  const [data, setData] = useState([]);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [day, setDay] = useState("");
  const [team, setTeam] = useState("");

  const [exportTeam, setExportTeam] = useState("A");

  const ITEMS_PER_PAGE = 20;

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [month, year, day, team]);

  useEffect(() => {
    setData(generateSchedule());
  }, []);

  const months = [...new Set(data.map((d) => d.date.getMonth()))];
  const years = [...new Set(data.map((d) => d.date.getFullYear()))];

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (month !== "" && d.date.getMonth() != month) return false;
      if (year !== "" && d.date.getFullYear() != year) return false;
      if (day && d.dayName !== day) return false;

      if (team) {
        if (team === "Full") return d.isFull;
        if (team === "Holiday") return d.isHoliday;
        return d.team === team;
      }

      return true;
    });
  }, [data, month, year, day, team]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h2 className="mb-4 text-2xl font-bold">
        WFO Schedule (BAFWEB Squads)
      </h2>

      {/* Team Notes */}

      <div className="mb-5 rounded border-l-4 border-slate-700 bg-slate-100 p-4">
        <strong>Notes</strong>

        <div className="mt-2 space-y-1">
          {teamMember.map((item) => (
            <div key={item.team}>
              Team {item.team}: {item.member.join(", ")}
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}

      <div className="mb-5 flex flex-wrap items-center gap-3">

        <label>Bulan</label>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua</option>

          {months.map((m) => (
            <option key={m} value={m}>
              {new Date(2026, m).toLocaleString("id-ID", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <label>Tahun</label>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua</option>

          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <label>Hari</label>

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua</option>
          <option value="Senin">Senin</option>
          <option value="Selasa">Selasa</option>
          <option value="Rabu">Rabu</option>
          <option value="Kamis">Kamis</option>
          <option value="Jumat">Jumat</option>
        </select>

        <label>Team</label>

        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua</option>
          <option value="A">Team A</option>
          <option value="B">Team B</option>
          <option value="C">Team C</option>
          <option value="D">Team D</option>
          <option value="Full">Full Team</option>
          <option value="Holiday">Libur</option>
        </select>

      </div>

      {/* Export */}

      <div className="mb-5 flex items-center gap-3">

        <label>Pilih Team</label>

        <select
          value={exportTeam}
          onChange={(e) => setExportTeam(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="A">Team A</option>
          <option value="B">Team B</option>
          <option value="C">Team C</option>
          <option value="D">Team D</option>
        </select>

        <button
          onClick={() => exportICS(data, exportTeam)}
          className="rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          Export Calendar (.ics)
        </button>

      </div>

      {/* Table */}

      <div className="overflow-x-auto rounded-lg border border-gray-600 bg-white shadow">
        <table className="min-w-full table-fixed border-collapse border border-gray-600">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="w-16 border border-gray-600 px-4 py-2">No</th>
              <th className="w-32 border border-gray-600 px-4 py-2">Hari</th>
              <th className="w-40 border border-gray-600 px-4 py-2">Tanggal</th>
              <th className="w-48 border border-gray-600 px-4 py-2">Keterangan</th>
              <th className="w-64 border border-gray-600 px-4 py-2">Cuti</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className={
                  item.isHoliday
                    ? "bg-red-600 text-white font-semibold"
                    : item.isFull
                      ? "bg-yellow-300 text-black font-semibold"
                      : "bg-white"
                }
              >
                <td className="border border-gray-600 px-4 py-2 text-center">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>

                <td className="border border-gray-600 px-4 py-2 text-center">
                  {item.dayName}
                </td>

                <td className="border border-gray-600 px-4 py-2 text-center">
                  {item.date.toLocaleDateString("id-ID")}
                </td>

                <td className="border border-gray-600 px-4 py-2 text-center">
                  {item.isHoliday
                    ? item.team
                    : item.isFull
                      ? "Full Team"
                      : `Team ${item.team}`}
                </td>

                <td className="border border-gray-600 px-4 py-2 text-center">
                  {item.cuti.length ? item.cuti.join(", ") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Menampilkan{" "}
          {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari{" "}
          {filtered.length} data
        </p>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="flex items-center px-2">
            {currentPage} / {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}