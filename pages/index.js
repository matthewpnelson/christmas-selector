import Head from "next/head";
import { useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { getNamesData, getKidsData } from "../libs/sheets";
import { drawTiered, adultTiers, kidTiers } from "../libs/draw";

const LISTS = {
  adults: {
    label: "Adults",
    historyKeys: ["oneAgo", "twoAgo", "threeAgo"],
    tiers: adultTiers,
  },
  kids: {
    label: "Kids",
    historyKeys: ["oneAgo", "twoAgo"],
    tiers: kidTiers,
  },
};

const randomSeed = () => Math.floor(Math.random() * 1000000);

export default function Home({ userData, kidsData, year }) {
  const rowsByList = { adults: userData, kids: kidsData };
  const [list, setList] = useState("adults");
  const [results, setResults] = useState({ adults: null, kids: null });
  const [seedInput, setSeedInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const shotRef = useRef(null);

  const config = LISTS[list];
  const rows = rowsByList[list];
  const result = results[list];

  const runDraw = (seed) => {
    const r = drawTiered(config.tiers(rows), seed);
    if (!r) {
      setError(
        "No draw fits the rules for this list. Check the sibling and history columns in the sheet.",
      );
      return;
    }
    setError("");
    setResults({ ...results, [list]: r });
    setSeedInput(String(r.seed));
  };

  const onSeedSubmit = (e) => {
    e.preventDefault();
    const seed = Number(seedInput);
    if (!seedInput.trim() || !Number.isInteger(seed) || seed < 0) {
      setError("Enter a whole number for the seed.");
      return;
    }
    runDraw(seed);
  };

  const switchList = (next) => {
    setList(next);
    setError("");
    setSeedInput(results[next] ? String(results[next].seed) : "");
  };

  const saveImage = async () => {
    setSaving(true);
    try {
      const { toBlob } = await import("html-to-image");
      const node = shotRef.current;
      const pad = 32;
      // The toolbar is filtered out of the image, so drop its height too.
      const toolbar = node.querySelector("[data-noshot]");
      const toolbarHeight =
        toolbar.offsetHeight + parseFloat(getComputedStyle(toolbar).marginBottom);
      const blob = await toBlob(node, {
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        width: node.offsetWidth + pad * 2,
        height: node.offsetHeight - toolbarHeight + pad * 2,
        style: { margin: "0", padding: `${pad}px`, boxSizing: "content-box" },
        filter: (n) => !(n.dataset && "noshot" in n.dataset),
      });
      const file = new File([blob], `nelson-${list}-${year}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError("Could not save the image. Take a screenshot instead.");
      }
    } finally {
      setSaving(false);
    }
  };

  const ruleText = result ? result.rule : config.tiers(rows)[0].rule;

  return (
    <div className={styles.page}>
      <Head>
        <title>Nelson Family Holidays</title>
        <meta name="description" content="Our holiday gift giving guide" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div ref={shotRef}>
          <header className={styles.header}>
            <h1 className={styles.title}>
              Nelson Holiday <span className={styles.accent}>Buying Guide</span>
            </h1>
            <p className={styles.subtitle}>Gift recipients for {year}</p>
          </header>

          <div className={styles.toolbar} data-noshot>
            <div className={styles.tabs} role="tablist" aria-label="List">
              {Object.entries(LISTS).map(([key, { label }]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={list === key}
                  className={styles.tab}
                  onClick={() => switchList(key)}
                >
                  {label}
                  <span className={styles.count}>{rowsByList[key].length}</span>
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              {result && (
                <button
                  className={styles.secondary}
                  onClick={saveImage}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save image"}
                </button>
              )}
              <button
                className={styles.primary}
                onClick={() => runDraw(randomSeed())}
                disabled={rows.length < 2}
              >
                {result ? "Draw again" : "Draw names"}
              </button>
            </div>
          </div>

          <section className={styles.panel} aria-live="polite">
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : result ? (
              <p className={styles.status}>
                <span className={styles.ok}>
                  All {rows.length} pairs pass the rules.
                </span>{" "}
                Seed <strong className={styles.num}>{result.seed}</strong>
              </p>
            ) : (
              <p className={styles.status}>
                {rows.length
                  ? `Press Draw names to pick this year's ${config.label.toLowerCase()} list.`
                  : "No names came back from the sheet. Check the Google Sheets credentials."}
              </p>
            )}

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Buys for</th>
                    {config.historyKeys.map((k, i) => (
                      <th scope="col" key={k} className={styles.history}>
                        {year - 1 - i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.name}>
                      <th scope="row">{row.name}</th>
                      <td className={styles.recipient}>
                        {result ? (
                          result.recipients[i]
                        ) : (
                          <span className={styles.blank}>—</span>
                        )}
                      </td>
                      {config.historyKeys.map((k) => (
                        <td key={k} className={styles.history}>
                          {row[k] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className={styles.rule}>{ruleText}</p>
          </section>
        </div>

        <form className={styles.seedForm} onSubmit={onSeedSubmit}>
          <label htmlFor="seed" className={styles.seedLabel}>
            Redraw from a seed
            <span className={styles.hint}>
              The same seed always gives the same list.
            </span>
          </label>
          <div className={styles.seedRow}>
            <input
              id="seed"
              className={styles.input}
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 482113"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
            />
            <button type="submit" className={styles.secondary}>
              Use seed
            </button>
          </div>
        </form>
      </main>

      <footer className={styles.footer}>Made with ❤️&nbsp;by Matthew</footer>
    </div>
  );
}

export async function getStaticProps() {
  const names = await getNamesData();
  const kids = await getKidsData();
  return {
    props: {
      userData: names.slice(1), // remove sheet header
      kidsData: kids.slice(1), // remove sheet header
      year: new Date().getFullYear(),
    },
    revalidate: 1, // In seconds
  };
}
