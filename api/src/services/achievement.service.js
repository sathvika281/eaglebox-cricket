const { query }         = require('../config/database');
const AchievementModel  = require('../models/achievement.model');

const ACHIEVEMENTS = {
  first_booking:     { label: 'First Booking',     icon: 'sports_cricket',    description: 'Made your first slot booking',    color: '#BFFF00' },
  first_payment:     { label: 'First Payment',     icon: 'payments',          description: 'Completed your first payment',    color: '#22CC66' },
  team_captain:      { label: 'Team Captain',      icon: 'military_tech',     description: 'Created your first team',         color: '#FFD700' },
  matches_5:         { label: '5 Matches',         icon: 'emoji_events',      description: 'Scheduled 5 or more matches',     color: '#7B61FF' },
  matches_10:        { label: '10 Matches',        icon: 'workspace_premium', description: 'Scheduled 10 or more matches',    color: '#FF6B35' },
  points_50:         { label: '50 Points',         icon: 'star',              description: 'Earned 50 reward points',         color: '#BFFF00' },
  points_100:        { label: '100 Points',        icon: 'grade',             description: 'Earned 100 reward points',        color: '#FFD700' },
  referral_champion: { label: 'Referral Champion', icon: 'handshake',         description: 'Completed 3 or more referrals',  color: '#FF6B35' },
  early_adopter:     { label: 'Early Adopter',     icon: 'verified',          description: 'Joined in the early days',       color: '#7B61FF' },
  match_organizer:   { label: 'Match Organizer',   icon: 'sports',            description: 'Organized 3 or more matches',    color: '#22CC66' },
};

const checkAndAwardAll = async (userId) => {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM bookings  WHERE user_id      = $1 AND is_deleted = FALSE)::int   AS total_bookings,
       (SELECT COUNT(*) FROM payments  WHERE user_id      = $1 AND status = 'paid')::int       AS total_payments,
       (SELECT COUNT(*) FROM teams     WHERE registered_by= $1 AND is_deleted = FALSE)::int    AS teams_created,
       (SELECT COUNT(*) FROM matches   WHERE created_by   = $1 AND status != 'cancelled')::int AS matches_scheduled,
       COALESCE((SELECT lifetime_points FROM reward_points WHERE user_id = $1), 0)::int        AS lifetime_points,
       (SELECT COUNT(*) FROM referrals WHERE referrer_id  = $1 AND status = 'completed')::int  AS referrals_completed,
       (SELECT created_at FROM users   WHERE id = $1)                                          AS joined_at`,
    [userId]
  );

  const s = rows[0];
  if (!s) return;

  const conditions = {
    first_booking:     parseInt(s.total_bookings)      >= 1,
    first_payment:     parseInt(s.total_payments)      >= 1,
    team_captain:      parseInt(s.teams_created)       >= 1,
    matches_5:         parseInt(s.matches_scheduled)   >= 5,
    matches_10:        parseInt(s.matches_scheduled)   >= 10,
    points_50:         parseInt(s.lifetime_points)     >= 50,
    points_100:        parseInt(s.lifetime_points)     >= 100,
    referral_champion: parseInt(s.referrals_completed) >= 3,
    early_adopter:     s.joined_at && new Date(s.joined_at) < new Date('2027-01-01'),
    match_organizer:   parseInt(s.matches_scheduled)   >= 3,
  };

  await Promise.all(
    Object.entries(conditions)
      .filter(([, met]) => met)
      .map(([type]) => AchievementModel.award(userId, type))
  );
};

module.exports = { ACHIEVEMENTS, checkAndAwardAll };
