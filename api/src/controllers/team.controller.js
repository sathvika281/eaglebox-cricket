const TeamService = require('../services/team.service');
const R = require('../utils/response.utils');

const getMyTeams    = async (req, res, next) => { try { const teams = await TeamService.getMyTeams(req.user.id); return R.success(res, { teams }); } catch(e){next(e);} };
const getTeam       = async (req, res, next) => { try { const team  = await TeamService.getTeamById(req.params.id, req.user.id); return R.success(res, { team }); } catch(e){next(e);} };
const createTeam    = async (req, res, next) => { try { const team  = await TeamService.createTeam(req.body, req.user.id); return R.created(res, { team }, 'Team created'); } catch(e){next(e);} };
const updateTeam    = async (req, res, next) => { try { const team  = await TeamService.updateTeam(req.params.id, req.body, req.user.id); return R.success(res, { team }, 'Team updated'); } catch(e){next(e);} };
const deleteTeam    = async (req, res, next) => { try { await TeamService.deleteTeam(req.params.id, req.user.id); return R.success(res, {}, 'Team deleted'); } catch(e){next(e);} };
const addMember     = async (req, res, next) => { try { const member = await TeamService.addMember(req.params.id, req.body, req.user.id); return R.created(res, { member }, 'Member added'); } catch(e){next(e);} };
const removeMember  = async (req, res, next) => { try { await TeamService.removeMember(req.params.id, req.params.memberId, req.user.id); return R.success(res, {}, 'Member removed'); } catch(e){next(e);} };
const assignCaptain = async (req, res, next) => { try { const member = await TeamService.assignCaptain(req.params.id, req.params.memberId, req.user.id); return R.success(res, { member }, 'Captain assigned'); } catch(e){next(e);} };

module.exports = { getMyTeams, getTeam, createTeam, updateTeam, deleteTeam, addMember, removeMember, assignCaptain };
