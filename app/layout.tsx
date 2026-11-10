import type { Metadata } from 'next';
import type { Viewport } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { sans } from '@/app/fonts';

import './globals.css';
import './navigation.css';

export const metadata: Metadata = {
  title: 'Audest — 개발자이자 메이커',
  description: '서울을 기반으로 웹, 클라우드 인프라, 보안, 오픈 소스 분야에서 활동하는 풀스택 개발자 Audest입니다.',
  openGraph: { title: 'Audest — 개발자이자 메이커', description: '웹, 클라우드 인프라, 보안, 오픈 소스 분야에서 활동하는 풀스택 개발자입니다.' },
  generator: 'Revamp',
};

// Declare only the appearances implemented by the site's styles.
export const viewport: Viewport = { colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={sans.variable}>
      <body className="isolate">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
