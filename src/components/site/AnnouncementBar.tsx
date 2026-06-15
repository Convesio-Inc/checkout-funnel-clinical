interface AnnouncementBarProps {
  timer: string;
}

export function AnnouncementBar({ timer }: AnnouncementBarProps) {
  return (
    <div
      data-section="announcement-bar"
      className="bg-[#1a3028] text-[#a8cdb8] text-[11px] py-[7px] px-4 flex items-center justify-center gap-7 flex-wrap"
    >
      <span>
        <span className="text-[#c8620a] mr-1">●</span>
        <strong className="text-white">11</strong> others are viewing this offer right now
      </span>
      <span>🚚 Free U.S. shipping on every order</span>
      <span>✓ 3rd-party tested</span>
      <span>
        Reserved for:{" "}
        <strong className="text-white font-mono">{timer}</strong>
      </span>
    </div>
  );
}
