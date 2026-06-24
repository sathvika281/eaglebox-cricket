const TeamModel          = require('../models/team.model');
const ActivityService    = require('./activity.service');
const AchievementService = require('./achievement.service');

const getMyTeams = async (userId) => TeamModel.findAllByUser(userId);

const getTeamById = async (id, userId) => {
  const team = await TeamModel.findById(id);
  if (!team) throw Object.assign(new Error('Team not found'), { statusCode: 404, expose: true });
  const members = await TeamModel.getMembers(id);
  return { ...team, members };
};

const createTeam = async (body, userId) => {
  const { team_name, description, logo_url, captain_name, captain_phone, captain_email } = body;
  const team = await TeamModel.create({ team_name, description, logo_url, captain_name: captain_name || body.name, captain_phone, captain_email, registered_by: userId });
  ActivityService.log(userId, ActivityService.TYPES.TEAM_CREATED,
    `Created team "${team.team_name}"`, team.id, 'team').catch(() => {});
  AchievementService.checkAndAwardAll(userId).catch(() => {});
  return team;
};

const updateTeam = async (id, body, userId) => {
  const team = await TeamModel.findById(id);
  if (!team) throw Object.assign(new Error('Team not found'), { statusCode: 404, expose: true });
  if (team.registered_by !== userId) throw Object.assign(new Error('You can only edit your own teams'), { statusCode: 403, expose: true });
  return TeamModel.update(id, body);
};

const deleteTeam = async (id, userId) => {
  const team = await TeamModel.findById(id);
  if (!team) throw Object.assign(new Error('Team not found'), { statusCode: 404, expose: true });
  if (team.registered_by !== userId) throw Object.assign(new Error('You can only delete your own teams'), { statusCode: 403, expose: true });
  return TeamModel.softDelete(id);
};

const addMember = async (teamId, body, userId) => {
  const team = await TeamModel.findById(teamId);
  if (!team) throw Object.assign(new Error('Team not found'), { statusCode: 404, expose: true });
  if (team.registered_by !== userId) throw Object.assign(new Error('Only the team owner can add members'), { statusCode: 403, expose: true });
  return TeamModel.addMember({ team_id: teamId, ...body });
};

const removeMember = async (teamId, memberId, userId) => {
  const team = await TeamModel.findById(teamId);
  if (!team) throw Object.assign(new Error('Team not found'), { statusCode: 404, expose: true });
  if (team.registered_by !== userId) throw Object.assign(new Error('Only the team owner can remove members'), { statusCode: 403, expose: true });
  const removed = await TeamModel.removeMember(memberId);
  if (!removed) throw Object.assign(new Error('Member not found'), { statusCode: 404, expose: true });
  return removed;
};

const assignCaptain = async (teamId, memberId, userId) => {
  const team = await TeamModel.findById(teamId);
  if (!team) throw Object.assign(new Error('Team not found'), { statusCode: 404, expose: true });
  if (team.registered_by !== userId) throw Object.assign(new Error('Only the team owner can assign captain'), { statusCode: 403, expose: true });
  return TeamModel.assignCaptain(teamId, memberId);
};

module.exports = { getMyTeams, getTeamById, createTeam, updateTeam, deleteTeam, addMember, removeMember, assignCaptain };
