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
    const status = searchParams.get("status");

    const where = [];
    const params = [];
    if (status && status !== "all") {
      where.push("r.status = ?");
      params.push(status);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await query(
      `SELECT r.*, 
              c.firstName AS clientFirstName, c.lastName AS clientLastName,
              co.firstName AS coachFirstName, co.lastName AS coachLastName
       FROM reservations r
       JOIN users c ON c.id = r.clientID
       JOIN users co ON co.id = r.coachID
       ${whereSql}
       ORDER BY r.createdAt DESC
       LIMIT 500`,
      params
    );

    return NextResponse.json({ reservations: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors du chargement des réservations." },
      { status: 500 }
    );
  }
}
