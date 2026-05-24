"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "./FadeIn";

type Status = "online" | "offline" | "error" | "checking";

export function ServerStatus() {
  const [keyStatus, setKeyStatus] = useState<Status>("checking");
  const [relayStatus, setRelayStatus] = useState<Status>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const check = async (url: string, setter: (s: Status) => void) => {
      try {
        const res = await fetch(url, { mode: "cors" });
        const data = await res.json();
        setter(data.status === "ok" ? "online" : "error");
      } catch {
        setter("offline");
      }
    };
    const runChecks = () => {
      check("https://keys.khord.org/v1/health", setKeyStatus);
      check("https://relay.khord.org/v1/health", setRelayStatus);
      setLastChecked(new Date());
    };
    runChecks();
    const interval = setInterval(runChecks, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: Status) =>
    status === "online"
      ? "#4ADE80"
      : status === "checking"
        ? "#5E7676"
        : "#EF4444";

  const statusLabel = (status: Status) =>
    status === "online"
      ? "Operational"
      : status === "checking"
        ? "Checking..."
        : "Unreachable";

  const rows: [string, string, Status][] = [
    ["Key Server", "keys.khord.org", keyStatus],
    ["Relay Server", "relay.khord.org", relayStatus],
  ];

  return (
    <section id="status" className="mx-auto max-w-[480px] px-6 pb-20 pt-10">
      <FadeIn>
        <div className="rounded-2xl border border-border-subtle bg-surface px-7 py-6">
          <div className="mb-[18px] flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Community Server Status
            </p>
            {lastChecked && (
              <span className="text-[11px] text-fg-dim">
                Updated{" "}
                {lastChecked.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          {rows.map(([name, host, status], i) => (
            <div
              key={name}
              className={`flex items-center justify-between py-2.5 ${
                i > 0 ? "border-t border-border-subtle" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full transition-all duration-300"
                  style={{
                    background: statusColor(status),
                    boxShadow:
                      status === "online"
                        ? "0 0 8px rgba(74,222,128,0.4)"
                        : "none",
                  }}
                />
                <div>
                  <span className="block text-sm font-medium text-fg">
                    {name}
                  </span>
                  <span className="text-xs text-fg-dim">{host}</span>
                </div>
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ color: statusColor(status) }}
              >
                {statusLabel(status)}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
