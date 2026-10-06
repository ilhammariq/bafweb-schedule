import { useEffect, useMemo, useState } from "react";
import { generateSchedule } from "../utils/schedule";
import { exportICS } from "../utils/exportICS";
import { members } from "../data/member";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/* ---------- Small building blocks ---------- */

function Avatar({ name, className = "" }) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 ${className}`}
    >
      {initials(name)}
    </span>
  );
}

function StatusBadge({ item }) {
  if (item.isHoliday) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        {item.member}
      </span>
    );
  }
  if (item.isFull) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Full Team
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 py-1 pl-1 pr-3 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
      <Avatar name={item.member} className="!h-5 !w-5 !text-[10px] bg-white" />
      {item.member}
    </span>
  );
}

function CutiPills({ list, tone = "light" }) {
  if (!list.length) {
    return (
      <span className={tone === "light" ? "text-slate-400" : "opacity-70"}>
        Tidak ada
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((n) => (
        <span
          key={n}
          className={
            tone === "light"
              ? "rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              : "rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium"
          }
        >
          {n}
        </span>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

/* ---------- Prev / next cards ---------- */

function MiniScheduleCard({ item, type }) {
  const title = type === "prev" ? "Kemarin" : "Besok";
  const fallbackTitle = type === "prev" ? "Sebelumnya" : "Berikutnya";
  const accent = type === "prev" ? "bg-slate-400" : "bg-indigo-500";

  if (!item) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
        <p className="text-sm font-medium text-slate-500">
          Jadwal {fallbackTitle}
        </p>
        <p className="mt-1 text-sm text-slate-400">Tidak ada data.</p>
      </div>
    );
  }

  const diffDays = Math.round(
    (startOfDay(item.date) - startOfDay(new Date())) / DAY_MS
  );
  const isExact = type === "prev" ? diffDays === -1 : diffDays === 1;
  const label = isExact ? title : fallbackTitle;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${accent}`} />

      <div className="flex items-start justify-between gap-3 pl-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">
            {item.dayName}, {item.date.toLocaleDateString("id-ID")}
          </p>
        </div>
        {item.isFull && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Full Team
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 pl-2">
        {!item.isFull && <Avatar name={item.member} className="!h-10 !w-10 !text-sm" />}
        <div>
          <p className="text-xs text-slate-500">WFO</p>
          <p className="text-lg font-bold leading-tight text-slate-900">
            {item.isFull ? "Semua anggota" : item.member}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 pl-2">
        <p className="mb-1.5 text-xs text-slate-500">Cuti / izin</p>
        <CutiPills list={item.cuti} />
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const [data, setData] = useState([]);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [day, setDay] = useState("");
  const [member, setMember] = useState("");

  const [exportMember, setExportMember] = useState(members[0] || "");

  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [month, year, day, member]);

  useEffect(() => {
    setData(generateSchedule());
  }, []);

  const todayString = useMemo(() => new Date().toLocaleDateString("id-ID"), []);

  const todaySchedule = useMemo(
    () => data.find((d) => d.date.toLocaleDateString("id-ID") === todayString),
    [data, todayString]
  );

  const { prevSchedule, nextSchedule } = useMemo(() => {
    const today = startOfDay(new Date());

    const workdays = data
      .filter((d) => !d.isHoliday)
      .sort((a, b) => a.date - b.date);

    const prev =
      [...workdays].reverse().find((d) => startOfDay(d.date) < today) || null;
    const next = workdays.find((d) => startOfDay(d.date) > today) || null;

    return { prevSchedule: prev, nextSchedule: next };
  }, [data]);

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

  const hasFilter = month !== "" || year !== "" || day !== "" || member !== "";
  const resetFilter = () => {
    setMonth("");
    setYear("");
    setDay("");
    setMember("");
  };

  const todayTs = startOfDay(new Date());

  const heroTheme = todaySchedule?.isHoliday
    ? "from-rose-600 to-rose-500 text-white"
    : todaySchedule?.isFull
      ? "from-amber-400 to-amber-300 text-amber-950"
      : "from-indigo-700 via-indigo-600 to-violet-600 text-white";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Jadwal WFO BAFWEB
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Lihat siapa yang masuk kantor hari ini, cek jadwal tim, lalu ekspor
            ke kalender.
          </p>
        </header>

        {/* Today hero */}
        {todaySchedule ? (
          <section
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 shadow-lg sm:p-8 ${heroTheme}`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs font-medium backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                  </span>
                  Hari ini · {todaySchedule.dayName}, {todayString}
                </span>

                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {todaySchedule.isHoliday
                    ? `Libur: ${todaySchedule.member}`
                    : todaySchedule.isFull
                      ? "Semua WFO"
                      : todaySchedule.member}
                </h2>
                <p className="mt-1 text-sm opacity-80">
                  {todaySchedule.isHoliday
                    ? "Tidak ada WFO hari ini."
                    : todaySchedule.isFull
                      ? "Seluruh anggota tim masuk kantor."
                      : "Bertugas WFO hari ini."}
                </p>
              </div>

              <div className="min-w-[220px] rounded-2xl bg-black/10 p-4 backdrop-blur">
                <p className="mb-2 text-xs font-medium opacity-80">
                  Cuti / izin hari ini
                </p>
                <CutiPills list={todaySchedule.cuti} tone="dark" />
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-700 p-6 text-white shadow-lg sm:p-8">
            <p className="text-xs font-medium opacity-70">Informasi</p>
            <h2 className="mt-1 text-2xl font-bold">
              Tidak ada jadwal WFO untuk hari ini.
            </h2>
          </section>
        )}

        {/* Prev / next */}
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <MiniScheduleCard item={prevSchedule} type="prev" />
          <MiniScheduleCard item={nextSchedule} type="next" />
        </section>

        {/* Members */}
        <section className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Anggota tim
          </h3>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm text-slate-700 shadow-sm"
              >
                <Avatar name={m} className="!h-6 !w-6 !text-[10px]" />
                {m}
              </span>
            ))}
          </div>
        </section>

        {/* Filter + export */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Filter</h3>
            {hasFilter && (
              <button
                onClick={resetFilter}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Bulan">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className={selectClass}
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
            </Field>

            <Field label="Tahun">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={selectClass}
              >
                <option value="">Semua</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Hari">
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className={selectClass}
              >
                <option value="">Semua</option>
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nama">
              <select
                value={member}
                onChange={(e) => setMember(e.target.value)}
                className={selectClass}
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
            </Field>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end">
            <div className="sm:w-64">
              <Field label="Ekspor jadwal untuk">
                <select
                  value={exportMember}
                  onChange={(e) => setExportMember(e.target.value)}
                  className={selectClass}
                >
                  {members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <button
              onClick={() => exportICS(data, exportMember)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 cursor-pointer"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M10 2a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V3a1 1 0 011-1z" />
                <path d="M4 15a1 1 0 011 1v1h10v-1a1 1 0 112 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a1 1 0 011-1z" />
              </svg>
              Ekspor kalender (.ics)
            </button>
          </div>
        </section>

        {/* Table */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-slate-200 [&::-webkit-scrollbar-thumb]:bg-slate-500">
            <table className="min-w-[680px] w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="w-16 px-5 py-3 text-center">No</th>
                  <th className="w-32 px-5 py-3">Hari</th>
                  <th className="w-40 px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Keterangan</th>
                  <th className="px-5 py-3">Cuti</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-400"
                    >
                      Tidak ada jadwal yang cocok dengan filter.
                    </td>
                  </tr>
                )}

                {paginatedData.map((item, index) => {
                  const isToday = startOfDay(item.date) === todayTs;
                  const rowTone = item.isHoliday
                    ? "bg-rose-50/60"
                    : item.isFull
                      ? "bg-amber-50/60"
                      : "bg-white";

                  return (
                    <tr
                      key={index}
                      className={`transition hover:bg-slate-50 ${rowTone} ${isToday ? "outline outline-2 -outline-offset-2 outline-indigo-400" : ""
                        }`}
                    >
                      <td className="px-5 py-3 text-center text-slate-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {item.dayName}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {item.date.toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge item={item} />
                      </td>
                      <td className="px-5 py-3">
                        <CutiPills list={item.cuti} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-medium text-slate-700">
                {filtered.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-slate-700">
                {filtered.length}
              </span>{" "}
              data
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sebelumnya
              </button>

              <span className="px-2 text-sm text-slate-600">
                {currentPage} / {totalPages || 1}
              </span>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}