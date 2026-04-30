import type { CSSProperties } from 'react'
import type { MosaicDecorativeVariant } from './useImageMosaicLayout'

interface MosaicDecorativeTileProps {
  variant: MosaicDecorativeVariant
  accentIndex: number
  rotation: number
  styleKind: 'panel' | 'micro'
}

const SHELL_CLASSES = [
  'rounded-[30px_20px_28px_22px]',
  'rounded-[22px_30px_20px_28px]',
  'rounded-[28px_24px_30px_18px]',
  'rounded-[18px_30px_24px_30px]',
]

function AiOrbitMark() {
  return (
    <svg className="h-full w-full" viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="22" fill="currentColor" fillOpacity="0.12" />
      <circle cx="80" cy="80" r="10" stroke="currentColor" strokeWidth="3" />
      <path d="M26 87c14-29 37-46 54-46 18 0 38 19 54 46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 49c21 8 33 20 42 31 9 11 18 28 22 48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 8" />
      <path d="M123 46c-18 10-31 24-40 42-5 11-9 24-11 39" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="86" r="6" fill="currentColor" />
      <circle cx="124" cy="46" r="5" fill="currentColor" />
      <circle cx="108" cy="132" r="4" fill="currentColor" />
    </svg>
  )
}

function BrushNoteMark() {
  return (
    <svg className="h-full w-full" viewBox="0 0 160 160" fill="none">
      <path d="M30 103c21-42 58-61 94-51-5 29-22 55-51 78-19 0-34-8-43-27Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M35 113c31-14 55-37 72-69" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 126c13-4 23-11 32-22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 7" />
      <circle cx="110" cy="48" r="8" stroke="currentColor" strokeWidth="3" />
      <circle cx="122" cy="72" r="5" fill="currentColor" />
      <circle cx="98" cy="82" r="5" fill="currentColor" fillOpacity="0.55" />
    </svg>
  )
}

function CuteStickerMark() {
  return (
    <svg className="h-full w-full" viewBox="0 0 160 160" fill="none">
      <path d="M53 45c10-12 19-18 27-18 10 0 20 7 30 20l16 3c7 2 12 9 12 17 0 8-3 15-9 20l-8 8 1 16c0 9-6 17-15 19-8 2-15 0-20-7l-9-10-16 4c-9 2-18-2-23-10-4-8-4-16 1-23l8-11-6-15c-3-8-1-17 6-23 7-5 16-6 23-1l12 11Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M65 72h.01M98 72h.01" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <path d="M65 98c7 7 15 10 23 10 9 0 17-3 24-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="m48 55 10-7M114 50l11 6M49 112l12-2M116 107l10 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function DraftFrameMark() {
  return (
    <svg className="h-full w-full" viewBox="0 0 160 160" fill="none">
      <rect x="30" y="30" width="100" height="100" rx="18" stroke="currentColor" strokeWidth="3" strokeDasharray="8 10" />
      <path d="M44 117 71 88l19 18 27-32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m40 52 16-12m48-3 18 4m-9 77 13 10m-80 2-15 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="56" cy="58" r="6" fill="currentColor" />
    </svg>
  )
}

function MagicSparkMark() {
  return (
    <svg className="h-full w-full" viewBox="0 0 160 160" fill="none">
      <path d="m59 106 45-45" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="m49 115 15-15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M102 46c2 13 9 20 22 23-13 3-20 10-22 23-2-13-9-20-22-23 13-3 20-10 22-23Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="3" />
      <path d="M58 52c1 8 5 12 13 14-8 2-12 6-13 14-2-8-6-12-14-14 8-2 12-6 14-14Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="3" />
      <circle cx="49" cy="115" r="8" fill="currentColor" />
    </svg>
  )
}

function renderVariant(variant: MosaicDecorativeVariant) {
  switch (variant) {
    case 'brush-note':
      return <BrushNoteMark />
    case 'cute-sticker':
      return <CuteStickerMark />
    case 'draft-frame':
      return <DraftFrameMark />
    case 'magic-spark':
      return <MagicSparkMark />
    case 'ai-orbit':
    default:
      return <AiOrbitMark />
  }
}

export default function MosaicDecorativeTile({
  variant,
  accentIndex,
  rotation,
  styleKind,
}: MosaicDecorativeTileProps) {
  const shellClass = SHELL_CLASSES[accentIndex] ?? SHELL_CLASSES[0]
  const style: CSSProperties = {
    transform: `rotate(${rotation}deg)`,
  }
  const isMicro = styleKind === 'micro'

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative flex h-full w-full items-center justify-center ${isMicro ? 'p-1.5 opacity-72' : 'p-3 opacity-80'}`}
      style={style}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden text-blue-300/80 dark:text-slate-400/50 ${
          isMicro
            ? 'rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.58),rgba(239,246,255,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.36)] dark:bg-[radial-gradient(circle,rgba(30,41,59,0.32),rgba(15,23,42,0.08))]'
            : `border border-dashed border-blue-200/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(239,246,255,0.3))] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:border-blue-300/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.28),rgba(30,41,59,0.16))] ${shellClass}`
        }`}
      >
        {!isMicro && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_52%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_46%)]" />
        )}
        <div className={`relative ${isMicro ? 'h-[62%] w-[62%]' : 'h-[74%] w-[74%]'}`}>
          {renderVariant(variant)}
        </div>
      </div>
    </div>
  )
}
