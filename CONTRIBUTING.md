# Help Keep the RISC-V Software Map Honest

This dashboard is only as good as its data — and the RISC-V ecosystem moves **fast**. A package that was "In Progress" last quarter may have shipped riscv64 binaries yesterday. A status marked "TBD" might be one upstream commit away from "Optimized."

**If you know something we don't, you can fix the map in under five minutes.** Every entry below has a real impact: vendors, distros, and developers use this catalog to decide where to invest porting effort.

> 🎯 **The single most valuable thing you can do:** correct one status that's wrong, and attach a link that proves it.

---

## Pick Your Path

You don't need to be a maintainer — or even clone the repo — to contribute.

### 🟢 Path 1 — Spotted something wrong? Open an issue (2 minutes, no Git)

The fastest way to help. Just tell us what's off:

> [**→ Open a new issue**](../../issues/new)

Include:
- **Which package** (and its current status on the dashboard)
- **What it should be** (Enabled / In Progress / Optimized / TBD)
- **A link that proves it** — a merged PR, release note, distro package, CI matrix, or upstream doc

That's it. A maintainer will turn it into a data change.

### 🟡 Path 2 — Edit the data right in your browser (5 minutes)

GitHub lets you edit a file and open a Pull Request without ever leaving the web UI:

1. Open [`public/data.yaml`](public/data.yaml).
2. Click the **✏️ pencil** (top-right of the file). GitHub forks the repo for you automatically.
3. Add or change an entry (see [the format below](#the-data-format)).
4. Scroll down, describe your change, and click **Propose changes**.

CI validates your edit automatically — no local setup required.

### 🔵 Path 3 — Full local workflow (for bulk updates)

```bash
git clone <your-fork-url>
cd adm-riscv-software-ecosystem
npm install
# edit public/data.yaml
npm run validate:data    # catch schema errors before you push
npm run dev              # optional: preview the dashboard locally
```

Then commit, push, and open a Pull Request against `main`.

---

## The Data Format

All entries live in [`public/data.yaml`](public/data.yaml). Each one looks like this:

```yaml
- id: 9999
  category: Web Browser
  software: "Chromium"
  status: Enabled
  type: Open Source
  riscvEnablement: "https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/linux/riscv.md"
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Unique identifier. Use the next free number — don't reuse one. |
| `category` | string | Grouping, e.g. `AI`, `Toolchain`, `Operating System`. Reuse an existing category if one fits. |
| `software` | string | The package name (quoted). |
| `status` | string | RISC-V enablement status — **must** be one of the allowed values below. |
| `type` | string | `Open Source` or `Commercial`. |
| `riscvEnablement` | URL | **The most important field.** A link that *proves* the status. |

### Choosing the right status — be strict

The credibility of this catalog depends on consistent, evidence-backed statuses. Use this rubric:

| Status | Use it when… | Good evidence |
| :--- | :--- | :--- |
| **Optimized** | RISC-V Vector (RVV) or hand-tuned riscv64 assembly is **merged upstream and released**. | Merged PR adding RVV kernels; release notes mentioning RISC-V optimization. |
| **Enabled** | There's **stable, official riscv64 support** — it builds and runs, and ships in upstream releases or a distro (Debian/Fedora/etc.). | Official riscv64 package; CI matrix with riscv64; upstream "supported architectures" doc. |
| **In Progress** | Active porting is happening, but there's **no stable official riscv64 release** yet. | Open porting PRs; tech-preview/beta; roadmap commitment. |
| **TBD** | No evidence either way, or RISC-V is **not applicable** (e.g. an arch-independent protocol, or an x86-only product). | — |

> 🔗 **A status without a proving link is a guess.** Always pair a status with a `riscvEnablement` URL pointing to the *strongest* available evidence — prefer a merged PR or official package over a forum post or marketing page.

---

## Before You Submit

Run the validator — CI runs the same check and will block a malformed PR:

```bash
npm install        # once
npm run validate:data
```

If it fails, the error names the offending field or entry. Fix it, re-run, repeat until green.

---

## Submitting

1. **Commit** with a clear message, e.g. `data: promote UCX to Enabled (Debian riscv64 pkg)`.
2. **Push** to your fork.
3. **Open a Pull Request** against `main`. In the description, link the evidence so review is fast.

CI validates every PR automatically. Once merged, the dashboard rebuilds and your change goes live within the hour. 🚀

**Thank you — every corrected status makes the RISC-V ecosystem a little more legible.**
