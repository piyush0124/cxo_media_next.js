import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "./admin/admin.css"; // ✅ move admin css here

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
