import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { requireAdmin } from "../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "1";

    const rows = await query(
      `SELECT b.*, 
              u.firstName AS userFirstName, u.lastName AS userLastName, u.email AS userEmail, u.role AS userRole,
              a.firstName AS bannedByFirstName, a.lastName AS bannedByLastName
       FROM bans b
       JOIN users u ON u.id = b.userID
       LEFT JOIN users a ON a.id = b.bannedBy
       ${activeOnly ? "WHERE b.isActive = 1" : ""}
       ORDER BY b.bannedAt DESC
       LIMIT 500`
    );

    return NextResponse.json({ bans: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors du chargement des bannissements." },
      { status: 500 }
    );
  }
}
