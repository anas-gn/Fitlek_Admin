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
    const role = searchParams.get("role"); // client | coach | advisor | admin | manager
    const status = searchParams.get("status"); // pending | approved | banned
    const search = searchParams.get("search");

    const where = [];
    const params = [];

    if (role && role !== "all") {
      where.push("u.role = ?");
      params.push(role);
    }

    if (status === "pending") {
      where.push("u.isApproved = 0");
    } else if (status === "approved") {
      where.push("u.isApproved = 1");
    } else if (status === "banned") {
      where.push(
        "EXISTS (SELECT 1 FROM bans b WHERE b.userID = u.id AND b.isActive = 1)"
      );
    }

    if (search) {
      where.push(
        "(u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ?)"
      );
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await query(
      `SELECT u.id, u.firstName, u.lastName, u.email, u.role, u.gender,
              u.avatarUrl, u.isPremium, u.isApproved, u.createdAt, u.updatedAt,
              (SELECT COUNT(*) FROM bans b WHERE b.userID = u.id AND b.isActive = 1) AS activeBans,
              CASE
                WHEN u.role = 'coach' THEN CONCAT(adv.firstName, ' ', adv.lastName)
                ELSE NULL
              END AS advisorName
       FROM users u
       LEFT JOIN coachprofiles cp ON cp.userID = u.id
       LEFT JOIN users adv ON adv.id = cp.advisorID
       ${whereSql}
       ORDER BY u.createdAt DESC
       LIMIT 500`,
      params
    );

    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors du chargement des utilisateurs." },
      { status: 500 }
    );
  }
}