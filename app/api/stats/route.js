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
    // Requêtes séquentielles au lieu de Promise.all :
    // avec le plan Clever Cloud limité à 5 connexions simultanées,
    // lancer 8 requêtes en parallèle dépasse le quota dès qu'une autre
    // route (ex: /api/auth/me) tourne en même temps.
    const usersByRole = await query(`SELECT role, COUNT(*) AS total FROM users GROUP BY role`);

    const pendingApprovals = await query(
      `SELECT role, COUNT(*) AS total FROM users
       WHERE isApproved = 0 AND role IN ('coach','advisor')
       GROUP BY role`
    );

    const activeBans = await query(`SELECT COUNT(*) AS total FROM bans WHERE isActive = 1`);

    const reservationsByStatus = await query(
      `SELECT status, COUNT(*) AS total FROM reservations GROUP BY status`
    );

    const revenue = await query(
      `SELECT COALESCE(SUM(price),0) AS total FROM reservations WHERE status = 'confirmed'`
    );

    const recentUsers = await query(
      `SELECT DATE(createdAt) AS day, COUNT(*) AS total FROM users
       WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(createdAt) ORDER BY day ASC`
    );

    const recentReservations = await query(
      `SELECT DATE(createdAt) AS day, COUNT(*) AS total FROM reservations
       WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(createdAt) ORDER BY day ASC`
    );

    const topCoaches = await query(
      `SELECT u.id, u.firstName, u.avatarUrl, u.lastName, COUNT(r.id) AS totalReviews, AVG(r.rating) AS avgRating
       FROM coachreviews r
       JOIN users u ON u.id = r.coachID
       GROUP BY r.coachID
       ORDER BY totalReviews DESC, avgRating DESC
       LIMIT 5`
    );

    const totalUsers = usersByRole.reduce((sum, r) => sum + Number(r.total), 0);

    return NextResponse.json({
      totalUsers,
      usersByRole,
      pendingApprovals,
      activeBans: activeBans[0]?.total || 0,
      reservationsByStatus,
      confirmedRevenue: Number(revenue[0]?.total || 0),
      recentUsers,
      recentReservations,
      topCoaches
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors du chargement des statistiques." },
      { status: 500 }
    );
  }
}