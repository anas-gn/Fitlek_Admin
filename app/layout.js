import "./globals.css";

export const metadata = {
  title: "SIRVYA Admin — Console de modération",
  description: "Console d'administration SIRVYA : comptes, bannissements, réservations.",
  icons: {
    icon: "/icon_app.png",
  },
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}