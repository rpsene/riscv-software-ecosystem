import React from "react";

interface HeaderProps {
  lastUpdated: string;
  totalCount: number;
}

const Header: React.FC<HeaderProps> = ({ lastUpdated, totalCount }) => {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <img
          src={`${import.meta.env.BASE_URL}riscv-logo.png`}
          alt="RISC-V logo"
          className="h-10 w-auto"
        />
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#003262]">
            Software Ecosystem
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tracking enablement status across key software packages. {""}
            {/* <span className="font-medium">{totalCount}</span> packages total. */}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <a
          href="https://github.com/riscv/adm-riscv-software-ecosystem/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#003262] px-4 py-2 rounded-full hover:bg-[#004a8f] transition-colors shadow-sm"
        >
          Contribute
        </a>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-full">
          <span className="uppercase tracking-wide">Last updated</span>
          <span className="font-semibold text-[#003262]">
            {lastUpdated || "n/a"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;