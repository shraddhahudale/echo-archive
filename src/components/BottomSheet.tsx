import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "framer-motion";
import type { ReactNode } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
};

const openSpring = { type: "spring" as const, damping: 32, stiffness: 260, mass: 0.9 };
const closeEase = { duration: 0.22, ease: "easeIn" as const };
const fadeEase = { duration: 0.15 };

export function BottomSheet({ open, onClose, labelledBy, children }: BottomSheetProps) {
  const reduce = useReducedMotion();
  const dragControls = useDragControls();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 100 || info.velocity.y > 700) onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div key="bottom-sheet" className="absolute inset-0 z-20 overflow-hidden">
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 cursor-default border-0 bg-white p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6, transition: reduce ? fadeEase : { duration: 0.28, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: reduce ? fadeEase : closeEase }}
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 max-h-[90%] overflow-y-auto rounded-t-[var(--radius-sheet)] bg-[var(--bg)] shadow-[var(--shadow-card)] outline-none"
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            variants={
              reduce
                ? {
                    hidden: { opacity: 0 },
                    shown: { opacity: 1, transition: fadeEase },
                    exit: { opacity: 0, transition: fadeEase },
                  }
                : {
                    hidden: { y: "100%" },
                    shown: { y: 0, transition: openSpring },
                    exit: { y: "100%", transition: closeEase },
                  }
            }
            initial="hidden"
            animate="shown"
            exit="exit"
          >
            <div
              className="flex h-11 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              aria-label="Drag to dismiss"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span className="h-1 w-9 rounded-full" style={{ background: "#D9D9D9" }} />
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
