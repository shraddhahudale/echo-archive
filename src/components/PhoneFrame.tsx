import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="frame-page">
      <div className="phone-frame">{children}</div>
    </div>
  );
}
