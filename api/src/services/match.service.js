const MatchModel         = require('../models/match.model');
const TeamModel          = require('../models/team.model');
const ActivityService    = require('./activity.service');
const AchievementService = require('./achievement.service');

const getMyMatches = async (userId, query) => MatchModel.findAllForUser(userId, query);

const getMatch = async (id, userId) => {
  const match = await MatchModel.findById(id);
  if (!match) throw Object.assign(new Error('Match not found'), { statusCode: 404, expose: true });
  return match;
};

const scheduleMatch = async (body, userId) => {
  const { team_a_id, team_b_id, opponent_name, match_date, match_time, venue_note, slot_id, booking_id } = body;

  if (!team_a_id) throw Object.assign(new Error('Your team is required'), { statusCode: 400, expose: true });
  if (!match_date) throw Object.assign(new Error('Match date is required'), { statusCode: 400, expose: true });
  if (!match_time) throw Object.assign(new Error('Match time is required'), { statusCode: 400, expose: true });
  if (!team_b_id && !opponent_name) throw Object.assign(new Error('Opponent team or opponent name is required'), { statusCode: 400, expose: true });

  const teamA = await TeamModel.findById(team_a_id);
  if (!teamA) throw Object.assign(new Error('Team A not found'), { statusCode: 404, expose: true });

  if (team_b_id) {
    const teamB = await TeamModel.findById(team_b_id);
    if (!teamB) throw Object.assign(new Error('Opponent team not found'), { statusCode: 404, expose: true });
    if (team_a_id === team_b_id) throw Object.assign(new Error('A team cannot play against itself'), { statusCode: 400, expose: true });
  }

  const normalizedTime = match_time.length > 5 ? match_time.slice(0, 5) : match_time;

  const match = await MatchModel.create({ team_a_id, team_b_id: team_b_id || null, opponent_name: opponent_name || null, slot_id, booking_id, match_date, match_time: normalizedTime, venue_note, created_by: userId });
  ActivityService.log(userId, ActivityService.TYPES.MATCH_SCHEDULED,
    `Scheduled a match on ${match_date}`, match.id, 'match').catch(() => {});
  AchievementService.checkAndAwardAll(userId).catch(() => {});
  return match;
};

const updateMatch = async (id, body, userId) => {
  const match = await MatchModel.findById(id);
  if (!match) throw Object.assign(new Error('Match not found'), { statusCode: 404, expose: true });
  if (match.created_by !== userId) throw Object.assign(new Error('Only the match organiser can update it'), { statusCode: 403, expose: true });
  return MatchModel.update(id, body);
};

const cancelMatch = async (id, userId) => {
  const match = await MatchModel.findById(id);
  if (!match) throw Object.assign(new Error('Match not found'), { statusCode: 404, expose: true });
  if (match.created_by !== userId) throw Object.assign(new Error('Only the match organiser can cancel it'), { statusCode: 403, expose: true });
  if (match.status === 'completed') throw Object.assign(new Error('Cannot cancel a completed match'), { statusCode: 400, expose: true });
  return MatchModel.update(id, { status: 'cancelled' });
};

module.exports = { getMyMatches, getMatch, scheduleMatch, updateMatch, cancelMatch };
