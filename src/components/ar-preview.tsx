"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";

export type ArInfo =
  | { kind: "floor"; l: number; w: number; h: number }
  | { kind: "wall"; w: number; h: number };

const fmt = (n: number) => String(n).replace(/\.0$/, "");

/** AR-д харах: real-size preview. Opens a 3D view; on a phone, «Өрөөндөө харах» places it in the room at true size. */
export function ArPreview({
  slug,
  name,
  ar,
}: {
  slug: string;
  name: string;
  ar: ArInfo;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [canAr, setCanAr] = useState<boolean | null>(null);
  const viewer = useRef<HTMLElement & { canActivateAR?: boolean }>(null);
  const dims =
    ar.kind === "wall"
      ? `${fmt(ar.w)} × ${fmt(ar.h)} см`
      : `${fmt(ar.l)} × ${fmt(ar.w)} × ${fmt(ar.h)} см`;

  useEffect(() => {
    if (!open) return;
    let alive = true;
    import("@google/model-viewer").then(() => alive && setReady(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      alive = false;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => {
    const el = viewer.current;
    if (!ready || !el) return;
    const onLoad = () => setCanAr(!!el.canActivateAR);
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [ready]);

  // dimension labels on the model (metres, model origin at the floor centre)
  const m = (cm: number) => cm / 100;
  const spots =
    ar.kind === "floor"
      ? [
          {
            id: "l",
            pos: `0 0.006 ${m(ar.w) / 2 + 0.015}`,
            normal: "0 0 1",
            text: `${fmt(ar.l)} см`,
          },
          {
            id: "w",
            pos: `${m(ar.l) / 2 + 0.015} 0.006 0`,
            normal: "1 0 0",
            text: `${fmt(ar.w)} см`,
          },
          {
            id: "h",
            pos: `${m(ar.l) / 2} ${0.006 + m(ar.h) / 2} ${m(ar.w) / 2}`,
            normal: "1 0 0",
            text: `${fmt(ar.h)} см`,
          },
        ]
      : [
          {
            id: "w",
            pos: `0 0 0.02`,
            normal: "0 -1 0",
            text: `${fmt(ar.w)} см`,
          },
          {
            id: "h",
            pos: `${m(ar.w) / 2} ${m(ar.h) / 2} 0.02`,
            normal: "1 0 0",
            text: `${fmt(ar.h)} см`,
          },
        ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mt-3 flex w-full items-center gap-3 rounded-2xl bg-graphite p-3 pr-4 text-left text-white ring-1 ring-black/10 hover:bg-graphite-2"
      >
        <span className="grad grid h-11 w-11 shrink-0 place-items-center rounded-xl">
          <CubeIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="display block text-[15px] font-bold">
            AR:{" "}
            {ar.kind === "wall" ? "хананд өлгөж үзэх" : "өрөөндөө тавьж үзэх"}
          </span>
          <span className="tnum block text-[12.5px] text-white/65">
            Бодит хэмжээгээр · {dims}
          </span>
        </span>
        <span className="label rounded-md bg-white/10 px-2 py-1 text-[10px] text-amber group-hover:bg-white/15">
          3D
        </span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name}: AR`}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="rise relative flex h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-plate sm:h-[80vh] sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grad h-1.5 shrink-0" aria-hidden />
              <div className="flex items-start gap-3 px-5 pt-4 pb-3">
                <div className="min-w-0 flex-1">
                  <p className="label text-teal">AR · бодит хэмжээ</p>
                  <p className="display mt-1 line-clamp-1 text-[18px] font-bold">
                    {name}
                  </p>
                  <p className="tnum text-[13px] text-mute">{dims}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Хаах"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-line hover:ring-ink"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <div className="relative mx-3 flex-1 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                {!ready && (
                  <p className="absolute inset-0 grid place-items-center text-[14px] text-mute">
                    3D загвар ачаалж байна…
                  </p>
                )}
                {ready && (
                  <model-viewer
                    ref={viewer}
                    src={`/ar/${slug}.glb`}
                    alt={`${name}: бодит хэмжээний AR загвар`}
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    ar-scale="fixed"
                    ar-placement={ar.kind}
                    camera-controls
                    {...(ar.kind === "floor"
                      ? { "auto-rotate": true }
                      : {
                          "min-camera-orbit": "-55deg 40deg auto",
                          "max-camera-orbit": "55deg 110deg auto",
                        })}
                    auto-rotate-delay="1500"
                    rotation-per-second="18deg"
                    shadow-intensity="0.8"
                    exposure="1.05"
                    camera-orbit={
                      ar.kind === "wall"
                        ? "0deg 85deg auto"
                        : "30deg 65deg auto"
                    }
                    touch-action="pan-y"
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                    }}
                  >
                    {spots.map((s) => (
                      <span
                        key={s.id}
                        slot={`hotspot-${s.id}`}
                        data-position={s.pos}
                        data-normal={s.normal}
                        className="tnum pointer-events-none rounded-md bg-ink/85 px-1.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap text-white"
                      >
                        {s.text}
                      </span>
                    ))}
                    <button
                      slot="ar-button"
                      type="button"
                      className="brick absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-brick px-5 py-3 font-semibold whitespace-nowrap text-white"
                    >
                      <CubeIcon />{" "}
                      {ar.kind === "wall"
                        ? "Хананд өлгөж харах"
                        : "Өрөөндөө харах"}
                    </button>
                  </model-viewer>
                )}
              </div>

              <div className="px-5 pt-3 pb-5 text-[13px] leading-relaxed text-ink-2">
                {canAr === false && (
                  <p className="mb-1.5 font-semibold text-ink">
                    AR-ыг утсаар үзнэ: энэ хуудсыг Android (Chrome) эсвэл iPhone
                    (Safari)-аар нээгээд «
                    {ar.kind === "wall"
                      ? "Хананд өлгөж харах"
                      : "Өрөөндөө харах"}
                    » товчийг дарна уу.
                  </p>
                )}
                <p>
                  {ar.kind === "wall"
                    ? "Жаазны бодит хэмжээтэй зураг. Утсаа хана руу чиглүүлбэл яг ямар том харагдахыг үзнэ."
                    : "Барааны бодит урт, өргөн, өндөртэй тунгалаг хайрцаг, дотор нь барааны зураг. Ширээ, тавиур дээрээ багтах эсэхийг харахад зориулсан, барааны 3D загвар биш."}
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function CubeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.8 20 7v10l-8 4.2L4 17V7l8-4.2Z" />
      <path d="M4 7l8 4.2L20 7M12 11.2v10" />
    </svg>
  );
}
