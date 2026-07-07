import "./globals.css";

export const metadata = {
  title: "Fitlek Admin — Console de modération",
  description: "Console d'administration Fitlek : comptes, bannissements, réservations.",
  icons: {
    icon: "/logoFitlek.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}