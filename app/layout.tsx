import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Myanmar, Noto_Sans_Sinhala, Noto_Sans_Tamil } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SettingsProvider } from '@/components/providers/settings-provider'
import { SkillStampToast } from '@/components/lesson/kit'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
// ミャンマー語・シンハラ語・タミル語の文字。パソコンに入っていないと文字化けするので用意する。
// preload しない（その文字が画面に出たときだけ読み込まれる）
const notoMyanmar = Noto_Sans_Myanmar({ weight: ["400", "700"], subsets: ["myanmar"], preload: false, variable: "--font-noto-myanmar" });
const notoSinhala = Noto_Sans_Sinhala({ subsets: ["sinhala"], preload: false, variable: "--font-noto-sinhala" });
const notoTamil = Noto_Sans_Tamil({ subsets: ["tamil"], preload: false, variable: "--font-noto-tamil" });

export const metadata: Metadata = {
  title: 'パソコンレッスン',
  description: '留学生のためのパソコン演習アプリ。Windowsパソコンの基礎操作、タイピング、キーボードルールをゲーム感覚で学ぼう！',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`font-sans antialiased ${notoMyanmar.variable} ${notoSinhala.variable} ${notoTamil.variable}`}>
        <SettingsProvider>
          {children}
          <SkillStampToast />
        </SettingsProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

