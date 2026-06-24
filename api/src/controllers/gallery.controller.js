const GalleryModel = require('../models/gallery.model');
const MatchModel   = require('../models/match.model');

const getPhotos = async (req, res, next) => {
  try {
    const photos = await GalleryModel.getPhotos(req.params.matchId);
    res.json({ success: true, data: { photos } });
  } catch (err) { next(err); }
};

const addPhoto = async (req, res, next) => {
  try {
    const { photo_url, caption } = req.body;
    if (!photo_url) return res.status(400).json({ success: false, message: 'photo_url is required' });

    const match = await MatchModel.findById(req.params.matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const photo = await GalleryModel.addPhoto({
      match_id: req.params.matchId,
      uploaded_by: req.user.id,
      photo_url,
      caption,
    });
    res.status(201).json({ success: true, data: { photo } });
  } catch (err) { next(err); }
};

const deletePhoto = async (req, res, next) => {
  try {
    const deleted = await GalleryModel.deletePhoto(req.params.photoId, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Photo not found or not yours' });
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) { next(err); }
};

const getAllPhotos = async (req, res, next) => {
  try {
    const photos = await GalleryModel.getAllForUser(req.user.id);
    res.json({ success: true, data: { photos } });
  } catch (err) { next(err); }
};

module.exports = { getPhotos, addPhoto, deletePhoto, getAllPhotos };
