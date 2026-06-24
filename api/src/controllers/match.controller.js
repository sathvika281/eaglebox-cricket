const MatchService = require('../services/match.service');
const R = require('../utils/response.utils');

const getMyMatches   = async (req, res, next) => { try { const matches = await MatchService.getMyMatches(req.user.id, req.query); return R.success(res, { matches }); } catch(e){next(e);} };
const getMatch       = async (req, res, next) => { try { const match   = await MatchService.getMatch(req.params.id, req.user.id); return R.success(res, { match }); } catch(e){next(e);} };
const scheduleMatch  = async (req, res, next) => { try { const match   = await MatchService.scheduleMatch(req.body, req.user.id); return R.created(res, { match }, 'Match scheduled'); } catch(e){next(e);} };
const updateMatch    = async (req, res, next) => { try { const match   = await MatchService.updateMatch(req.params.id, req.body, req.user.id); return R.success(res, { match }, 'Match updated'); } catch(e){next(e);} };
const cancelMatch    = async (req, res, next) => { try { const match   = await MatchService.cancelMatch(req.params.id, req.user.id); return R.success(res, { match }, 'Match cancelled'); } catch(e){next(e);} };

module.exports = { getMyMatches, getMatch, scheduleMatch, updateMatch, cancelMatch };
