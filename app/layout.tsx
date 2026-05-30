import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Picker — US Market",
  description: "คัดหุ้นเด่น ETF น่าเก็บ พร้อมข่าวมาแรงสำหรับการลงทุนหุ้นอเมริกา",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.11.0/dist/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
