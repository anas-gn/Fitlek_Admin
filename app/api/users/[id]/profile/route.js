import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { requireAdmin } from "../../../../../lib/auth";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const userRows = await query(
      `SELECT u.id, u.firstName, u.lastName, u.email, u.role, u.avatarUrl,
              u.isApproved, u.isPremium, u.gender, u.height,
              u.createdAt, u.updatedAt
       FROM users u
       WHERE u.id = ?`,
      [id]
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const user = userRows[0];
    let profileData = {};
    let advisorName = null;

    if (user.role === "coach") {
      const coachRows = await query(
        `SELECT cp.tel AS phone, cp.bio, cp.certificateUrl,
                cp.price, cp.instagramPage, cp.invitationCode,
                cp.totalInvitations, cp.earnedPoints,
                CONCAT(adv.firstName, ' ', adv.lastName) AS advisorName
         FROM coachprofiles cp
         LEFT JOIN users adv ON adv.id = cp.advisorID
         WHERE cp.userID = ?`,
        [id]
      );
      if (coachRows && coachRows.length > 0) {
        const { advisorName: advName, ...rest } = coachRows[0];
        profileData = rest;
        advisorName = advName;
      }
    } else if (user.role === "advisor") {
      const advisorRows = await query(
        `SELECT ap.bio, ap.specialty, ap.location, ap.companyName
         FROM advisorprofiles ap
         WHERE ap.userID = ?`,
        [id]
      );
      if (advisorRows && advisorRows.length > 0) {
        profileData = advisorRows[0];
      }
    }

    let reservationsSql;
    let reservationsParams;
    if (user.role === "coach") {
      reservationsSql = `(SELECT COUNT(*) FROM reservations WHERE coachID = ?)`;
      reservationsParams = [id];
    } else if (user.role === "client") {
      reservationsSql = `(SELECT COUNT(*) FROM reservations WHERE clientID = ?)`;
      reservationsParams = [id];
    } else {
      reservationsSql = `(SELECT 0)`;
      reservationsParams = [];
    }

    let reviewsSql;
    let reviewsParams;
    if (user.role === "coach") {
      reviewsSql = `(SELECT COUNT(*) FROM coachreviews WHERE coachID = ?)`;
      reviewsParams = [id];
    } else if (user.role === "advisor") {
      reviewsSql = `(SELECT COUNT(*) FROM gymreviews WHERE advisorID = ?)`;
      reviewsParams = [id];
    } else if (user.role === "client") {
      reviewsSql = `((SELECT COUNT(*) FROM coachreviews WHERE clientID = ?) + (SELECT COUNT(*) FROM gymreviews WHERE clientID = ?))`;
      reviewsParams = [id, id];
    } else {
      reviewsSql = `(SELECT 0)`;
      reviewsParams = [];
    }

    let coachesSql;
    let coachesParams;
    if (user.role === "advisor") {
      coachesSql = `(SELECT COUNT(*) FROM coachprofiles WHERE advisorID = ?)`;
      coachesParams = [id];
    } else {
      coachesSql = `(SELECT 0)`;
      coachesParams = [];
    }

    const statsRows = await query(
      `SELECT 
         ${reservationsSql} AS reservationsCount,
         ${reviewsSql} AS reviewsCount,
         ${coachesSql} AS coachesCount,
         (SELECT COUNT(*) FROM messages WHERE senderID = ?) AS messagesCount,
         (SELECT COUNT(*) FROM bans WHERE userID = ? AND isActive = 1) AS activeBans`,
      [...reservationsParams, ...reviewsParams, ...coachesParams, id, id]
    );

    const stats = statsRows[0];

    const result = {
      ...user,
      ...profileData,
      advisorName,
      reservationsCount: stats.reservationsCount || 0,
      reviewsCount: stats.reviewsCount || 0,
      coachesCount: stats.coachesCount || 0,
      messagesCount: stats.messagesCount || 0,
      activeBans: stats.activeBans || 0,
    };

    return NextResponse.json(result);

  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { error: "Erreur serveur", details: err.message },
      { status: 500 }
    );
  }
}