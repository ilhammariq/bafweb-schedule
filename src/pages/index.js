import { useEffect, useMemo, useState } from "react";
import { generateSchedule } from "../utils/schedule";
import { exportICS } from "../utils/exportICS";
import { members } from "../data/member";

export default function Home() {
  const [data, setData] = useState([]);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [day, setDay] = useState("");
  const [member, setMember] = useState("");

  const [exportMember, setExportMember] = useState(members[0] || "");

  const ITEMS_PER_PAGE = 20;

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [month, year, day, member]);

  useEffect(() => {
    setData(generateSchedule());
  }, []);

  const todayString = useMemo(() => {
    return new Date().toLocaleDateString("id-ID");
  }, []);

  const todaySchedule = useMemo(() => {
    return data.find((d) => d.date.toLocaleDateString("id-ID") === todayString);
  }, [data, todayString]);

  const months = [...new Set(data.map((d) => d.date.getMonth()))];
  const years = [...new Set(data.map((d) => d.date.getFullYear()))];

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (month !== "" && d.date.getMonth() != month) return false;
      if (year !== "" && d.date.getFullYear() != year) return false;
      if (day && d.dayName !== day) return false;

      if (member) {
        if (member === "Full") return d.isFull;
        if (member === "Holiday") return d.isHoliday;
        return d.member === member;
      }

      return true;
    });
  }, [data, month, year, day, member]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (

    <div className="min-h-screen bg-gray-100 p-6">
      {todaySchedule ? (
        <div
          className={`mb-5 rounded-xl p-6 text-white shadow-lg border-2 ${todaySchedule.isHoliday
            ? "bg-gradient-to-r from-red-600 to-red-500 border-red-700"
            : todaySchedule.isFull
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 border-amber-600 !text-black"
              : "bg-gradient-to-r from-blue-700 to-indigo-600 border-blue-800"
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${todaySchedule.isFull ? "bg-black/10 text-black" : "bg-white/20 text-white"
                }`}>
                Jadwal Hari Ini ({todaySchedule.dayName}, {todayString})
              </span>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                {todaySchedule.isHoliday
                  ? `Libur: ${todaySchedule.member}`
                  : todaySchedule.isFull
                    ? "🎉 SEMUA WFO (Full Team)"
                    : `🚀 WFO: ${todaySchedule.member}`}
              </h1>
            </div>

            <div className={`rounded-lg p-3 min-w-[200px] ${todaySchedule.isFull ? "bg-black/5" : "bg-white/10"
              }`}>
              <span className="text-xs font-semibold uppercase block opacity-80">
                Cuti / Izin Hari Ini:
              </span>
              <p className="text-sm font-medium mt-1">
                {todaySchedule.cuti.length ? todaySchedule.cuti.join(", ") : "- Tidak ada -"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 border-gray-800 p-6 text-white shadow-lg border-2">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Informasi
          </span>
          <h1 className="mt-2 text-2xl font-extrabold">
            Tidak ada jadwal WFO untuk hari ini.
          </h1>
        </div>
      )}

      <h2 className="mb-4 text-2xl font-bold">
        WFO Schedule (BAFWEB)
      </h2>

      {/* Member Notes */}

      <div className="mb-5 rounded border-l-4 border-slate-700 bg-slate-100 p-4">
        <strong>Anggota</strong>

        <div className="mt-2">
          {members.join(", ")}
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

        <label>Nama</label>

        <select
          value={member}
          onChange={(e) => setMember(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Semua</option>
          {members.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
          <option value="Full">Full Team</option>
          <option value="Holiday">Libur</option>
        </select>

      </div>

      {/* Export */}

      <div className="mb-5 flex items-center gap-3">

        <label>Pilih Nama</label>

        <select
          value={exportMember}
          onChange={(e) => setExportMember(e.target.value)}
          className="rounded border px-3 py-2"
        >
          {members.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <button
          onClick={() => exportICS(data, exportMember)}
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
                    ? item.member
                    : item.isFull
                      ? "Full Team"
                      : item.member}
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