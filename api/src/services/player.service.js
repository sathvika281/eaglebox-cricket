const QRCode             = require('qrcode');
const PlayerModel        = require('../models/player.model');
const AchievementModel   = require('../models/achievement.model');
const UserModel          = require('../models/user.model');
const AchievementService = require('./achievement.service');

const RANK_THRESHOLDS = [
  { min: 5000, rank: 'Diamond'        },
  { min: 1500, rank: 'Platinum'       },
  { min: 500,  rank: 'Gold Player'    },
  { min: 100,  rank: 'Silver Player'  },
  { min: 0,    rank: 'Bronze Player'  },
];

const LEVEL_THRESHOLDS = [
  { min: 500, level: 'Elite Player'   },
  { min: 200, level: 'Pro Player'     },
  { min: 80,  level: 'Regular Player' },
  { min: 20,  level: 'Amateur'        },
  { min: 0,   level: 'Beginner'       },
];

const getRank = (totalPoints) => {
  for (const t of RANK_THRESHOLDS) if (totalPoints >= t.min) return t.rank;
  return 'Bronze Player';
};

const getLevel = (totalBookings, matchesScheduled, lifetimePoints) => {
  const score = totalBookings * 10 + matchesScheduled * 15 + Math.floor(lifetimePoints / 10);
  for (const t of LEVEL_THRESHOLDS) if (score >= t.min) return t.level;
  return 'Beginner';
};

const _enrichAchievements = (earned) => {
  const earnedMap = new Map(earned.map(a => [a.achievement_type, a.earned_at]));
  return Object.entries(AchievementService.ACHIEVEMENTS).map(([type, def]) => ({
    type,
    ...def,
    unlocked:  earnedMap.has(type),
    earned_at: earnedMap.get(type) || null,
  }));
};

const getMyProfile = async (userId) => {
  // Ensure profile row exists and run achievement check in parallel
  const [profile, user, stats, earned, timeline] = await Promise.all([
    PlayerModel.getOrCreate(userId),
    UserModel.findById(userId),
    PlayerModel.getStats(userId),
    AchievementModel.getForUser(userId),
    PlayerModel.getTimeline(userId, 30),
  ]);

  // Fire-and-forget achievement check so new ones are unlocked on next load
  AchievementService.checkAndAwardAll(userId).catch(() => {});

  const totalPoints    = parseInt(stats.total_points);
  const lifetimePoints = parseInt(stats.lifetime_points);
  const rank  = getRank(totalPoints);
  const level = getLevel(
    parseInt(stats.total_bookings),
    parseInt(stats.matches_scheduled),
    lifetimePoints
  );

  return {
    cricket_id:         profile.cricket_id,
    name:               user.name,
    email:              user.email,
    joined_at:          user.created_at,
    rank,
    level,
    bio:                profile.bio || '',
    profile_visibility: profile.profile_visibility,
    stats: {
      total_bookings:      parseInt(stats.total_bookings),
      matches_scheduled:   parseInt(stats.matches_scheduled),
      matches_completed:   parseInt(stats.matches_completed),
      teams_joined:        parseInt(stats.teams_joined),
      teams_created:       parseInt(stats.teams_created),
      lifetime_points:     lifetimePoints,
      total_points:        totalPoints,
      referrals_completed: parseInt(stats.referrals_completed),
    },
    achievements: _enrichAchievements(earned),
    timeline,
  };
};

const getPublicProfile = async (cricketId) => {
  const profile = await PlayerModel.findByCricketId(cricketId);
  if (!profile) throw Object.assign(new Error('Player not found'), { statusCode: 404, expose: true });
  if (profile.profile_visibility === 'private') {
    throw Object.assign(new Error('This profile is private'), { statusCode: 403, expose: true });
  }

  const [stats, earned] = await Promise.all([
    PlayerModel.getStats(profile.user_id),
    AchievementModel.getForUser(profile.user_id),
  ]);

  const totalPoints    = parseInt(stats.total_points);
  const lifetimePoints = parseInt(stats.lifetime_points);

  return {
    cricket_id:  profile.cricket_id,
    name:        profile.name,
    joined_at:   profile.joined_at,
    rank:        getRank(totalPoints),
    level:       getLevel(parseInt(stats.total_bookings), parseInt(stats.matches_scheduled), lifetimePoints),
    stats: {
      total_bookings:      parseInt(stats.total_bookings),
      matches_scheduled:   parseInt(stats.matches_scheduled),
      matches_completed:   parseInt(stats.matches_completed),
      teams_joined:        parseInt(stats.teams_joined),
      teams_created:       parseInt(stats.teams_created),
      lifetime_points:     lifetimePoints,
      referrals_completed: parseInt(stats.referrals_completed),
    },
    achievements: _enrichAchievements(earned).filter(a => a.unlocked),
  };
};

const getQRCode = async (userId) => {
  const profile    = await PlayerModel.getOrCreate(userId);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const profileURL  = `${frontendUrl}/player/${profile.cricket_id}`;
  const qrDataURL   = await QRCode.toDataURL(profileURL, {
    width: 300, margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });
  return { qr: qrDataURL, url: profileURL, cricket_id: profile.cricket_id };
};

const updateProfile = async (userId, { bio, profile_visibility }) => {
  const fields = {};
  if (bio !== undefined)                fields.bio                = bio;
  if (profile_visibility !== undefined) fields.profile_visibility = profile_visibility;
  if (!Object.keys(fields).length) {
    throw Object.assign(new Error('Nothing to update'), { statusCode: 400, expose: true });
  }
  await PlayerModel.getOrCreate(userId);
  return PlayerModel.update(userId, fields);
};

module.exports = { getMyProfile, getPublicProfile, getQRCode, updateProfile, getRank, getLevel };
