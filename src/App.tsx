import React, { useEffect, useMemo, useState } from "react";
import * as yaml from "js-yaml";
import Header from "./components/Header";
import FiltersBar from "./components/FiltersBar";
import StatusDonut from "./components/StatusDonut";
import DataTable from "./components/DataTable";

const PAGE_SIZE = 100;

type Row = {
  id: number | string;
  category: string;
  software: string;
  status: string;
  type: string;
  riscvEnablement: string;
};

const App: React.FC = () => {
  const [rawData, setRawData] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "All",
    type: "All",
    status: "All",
  });

  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: "software" | "category" | "status" | "type";
    direction: "asc" | "desc";
  }>({
    key: "software",
    direction: "asc",
  });

  // Static site: build-time or fallback last updated
  const lastUpdated =
    import.meta.env.VITE_BUILD_TIME ||
    new Date().toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Fetch YAML once per page load
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data.yaml?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch data.yaml: ${res.statusText}`);
        }
        const text = await res.text();
        const parsed = yaml.load(text);
        setRawData(Array.isArray(parsed) ? (parsed as Row[]) : []);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter options
  const categoryOptions = useMemo(() => {
    const set = new Set(rawData.map((d) => d.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [rawData]);

  const typeOptions = useMemo(() => {
    const set = new Set(rawData.map((d) => d.type).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [rawData]);

  const statusOptions = useMemo(() => {
    const set = new Set(rawData.map((d) => d.status).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [rawData]);

  // 1) Filters (Category / Type / Status) – table + export only
  const filteredByFilters = useMemo(() => {
    let out = [...rawData];

    if (filters.category !== "All") {
      out = out.filter((row) => row.category === filters.category);
    }
    if (filters.type !== "All") {
      out = out.filter((row) => row.type === filters.type);
    }
    if (filters.status !== "All") {
      out = out.filter((row) => row.status === filters.status);
    }

    return out;
  }, [rawData, filters]);

  // 2) Search – table + export only (NOT chart)
  const filteredData = useMemo(() => {
    if (!search.trim()) return filteredByFilters;

    const query = search.toLowerCase();
    return filteredByFilters.filter((row) =>
      Object.values(row)
        .filter((v) => v !== null && v !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [filteredByFilters, search]);

  // 3) Sorting – on Software / Category / Status / Type
  const sortedData = useMemo(() => {
    const copy = [...filteredData];

    copy.sort((a: Row, b: Row) => {
      const aVal = (a[sortConfig.key] ?? "").toString().toLowerCase();
      const bVal = (b[sortConfig.key] ?? "").toString().toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = useMemo(() => {
    if (showAll) return 1;
    return Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  }, [sortedData.length, showAll]);

  const pagedData = useMemo(() => {
    if (showAll) return sortedData;
    const start = (page - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, page, showAll]);

  useEffect(() => {
    // Reset page whenever filters, search or sort change
    setPage(1);
  }, [filters, search, sortConfig]);

  // CSV export of filtered + sorted view.
  // papaparse is loaded on demand so it stays out of the initial bundle.
  const handleExportCsv = async () => {
    if (!sortedData.length) return;

    const { unparse } = await import("papaparse");

    const csv = unparse(
      sortedData.map((row: Row) => ({
        ID: row.id,
        Category: row.category,
        Software: row.software,
        Status: row.status,
        Type: row.type,
        "RISC-V Enablement": row.riscvEnablement,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.download = `packages-${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (
    key: "category" | "type" | "status",
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-700 text-lg font-medium">
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-sm max-w-lg">
          <div className="font-semibold mb-1">Error loading data</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 1. Header */}
        <Header lastUpdated={lastUpdated} totalCount={rawData.length} />

        {/* 2. Chart – global, UNFILTERED */}
        <StatusDonut data={rawData} />

        {/* 3. Search + filters */}
        <FiltersBar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          categoryOptions={categoryOptions}
          typeOptions={typeOptions}
          statusOptions={statusOptions}
        />

        {/* 4. Table */}
        <DataTable
          data={pagedData}
          fullLength={sortedData.length}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          showAll={showAll}
          setShowAll={setShowAll}
          onExportCsv={handleExportCsv}
          sortBy={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSortChange={(key) =>
            setSortConfig((prev) =>
              prev.key === key
                ? {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                  }
                : { key, direction: "asc" }
            )
          }
        />
      </div>
    </div>
  );
};

export default App;