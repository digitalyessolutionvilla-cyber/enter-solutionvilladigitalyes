interface AvatarProps {
  state: "idle" | "thinking" | "speaking" | "greeting";
  size?: number;
}

export default function SolutionAvatar({ state, size = 56 }: AvatarProps) {
  const isThinking = state === "thinking";
  const isSpeaking = state === "speaking";

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          animation: isThinking
            ? "sv-pulse 1.2s ease-in-out infinite"
            : "sv-breathe 4s ease-in-out infinite",
        }}
      >
        <defs>
          <linearGradient id="svAvatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <linearGradient id="svSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8956A" />
            <stop offset="100%" stopColor="#A0714A" />
          </linearGradient>
          <linearGradient id="svSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#2D2D2D" />
          </linearGradient>
          <clipPath id="svCircleClip">
            <circle cx="50" cy="50" r="49" />
          </clipPath>
        </defs>

        {/* Gold ring + dark background */}
        <circle cx="50" cy="50" r="49" fill="url(#svAvatarBg)" />
        <circle cx="50" cy="50" r="44" fill="#111111" />

        {/* Body / suit */}
        <ellipse cx="50" cy="90" rx="32" ry="20" fill="url(#svSuitGrad)" clipPath="url(#svCircleClip)" />
        <path d="M 38 72 L 50 76 L 62 72 L 60 90 L 40 90 Z" fill="#F5F5F5" clipPath="url(#svCircleClip)" />
        <path d="M 48 72 L 50 78 L 52 72 L 51 80 L 50 84 L 49 80 Z" fill="#D4AF37" clipPath="url(#svCircleClip)" />
        <path d="M 38 72 L 30 65 L 35 90 L 40 90 Z" fill="url(#svSuitGrad)" clipPath="url(#svCircleClip)" />
        <path d="M 62 72 L 70 65 L 65 90 L 60 90 Z" fill="url(#svSuitGrad)" clipPath="url(#svCircleClip)" />

        {/* Neck */}
        <rect x="44" y="62" width="12" height="12" rx="3" fill="url(#svSkinGrad)" />

        {/* Head */}
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="url(#svSkinGrad)" />

        {/* Hair */}
        <path d="M 28 44 Q 28 22 50 20 Q 72 22 72 44 Q 70 30 50 28 Q 30 30 28 44 Z" fill="#1a0f00" />

        {/* Ears */}
        <ellipse cx="27" cy="48" rx="4" ry="5" fill="url(#svSkinGrad)" />
        <ellipse cx="73" cy="48" rx="4" ry="5" fill="url(#svSkinGrad)" />

        {/* Headset */}
        <path d="M 27 42 Q 50 18 73 42" stroke="#D4AF37" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="21" y="44" width="10" height="10" rx="5" fill="#D4AF37" />
        <rect x="69" y="44" width="10" height="10" rx="5" fill="#D4AF37" />
        <path d="M 73 52 Q 80 58 76 63" stroke="#D4AF37" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="76" cy="64" r="3" fill="#D4AF37" />

        {/* Eyes */}
        <ellipse cx="42" cy="46" rx="4" ry="4.5" fill="white" />
        <ellipse cx="58" cy="46" rx="4" ry="4.5" fill="white" />
        <circle cx="43" cy="47" r="2.5" fill="#1a0f00" />
        <circle cx="59" cy="47" r="2.5" fill="#1a0f00" />
        <circle cx="44" cy="46" r="0.8" fill="white" />
        <circle cx="60" cy="46" r="0.8" fill="white" />
        <path d="M 38 41 Q 42 39 46 41" stroke="#1a0f00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 54 41 Q 58 39 62 41" stroke="#1a0f00" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M 49 51 Q 47 55 50 56 Q 53 55 51 51" stroke="#8B6030" strokeWidth="1" fill="none" />

        {/* Mouth */}
        {isSpeaking ? (
          <ellipse cx="50" cy="59" rx="7" ry="4" fill="#1a0f00" />
        ) : (
          <path d="M 43 58 Q 50 64 57 58" stroke="#1a0f00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
