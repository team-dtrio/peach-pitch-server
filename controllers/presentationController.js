const mongoose = require("mongoose");
const Presentation = require("../models/Presentation");

async function getAllPresentations(req, res, next) {
  const { user_id } = req.params;

  try {
    const presentations = await Presentation.find({ userId: user_id });

    if (presentations.length === 0) {
      return res.status(200).json({
        result: "success",
        message: "No presentations found created by the user",
        presentations: [],
      });
    }

    res.json({ result: "success", presentations });
  } catch (err) {
    next(err);
  }
}

async function createPresentation(req, res, next) {
  const { title } = req.body;
  const { user_id } = req.params;
  const newSlide = {
    slideId: new mongoose.Types.ObjectId(),
    objects: [],
    animationSeq: [],
  };

  try {
    const newPresentation = await Presentation.create({
      title,
      userId: user_id,
      slides: [newSlide],
    });

    res.status(200).json({ result: "success", presentation: newPresentation });
  } catch (err) {
    next(err);
  }
}

async function deletePresentation(req, res, next) {
  const { presentation_id } = req.params;

  try {
    const deletedPresentation = await Presentation.findByIdAndDelete(
      presentation_id,
    );

    if (!deletedPresentation) {
      return res
        .status(404)
        .json({ result: "error", message: "No presentation found to delete" });
    }

    res.status(200).json({
      result: "success",
      message: "Presentation successfully deleted",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllPresentations,
  createPresentation,
  deletePresentation,
};
