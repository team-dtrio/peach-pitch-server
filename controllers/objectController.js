const _ = require("lodash");

const mongoose = require("mongoose");
const Presentation = require("../models/Presentation");

async function createObject(req, res, next) {
  const { presentation_id, slide_id } = req.params;
  const { type, imageUrl } = req.body;
  const defaultObjectProperties = {
    objectId: new mongoose.Types.ObjectId(),
    type,
    coordinates: { x: 100, y: 100 },
    dimensions: { height: 100, width: 100 },
    boundaryVertices: [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 100, y: 100 },
      { x: 50, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 50 },
    ],
    animation: {},
  };

  switch (type) {
    case "Circle":
      defaultObjectProperties.Circle = {
        radius: 50,
        fillColor: "#d9d9d9",
        borderColor: "transparent",
      };
      break;
    case "Triangle":
      defaultObjectProperties.Triangle = {
        vertices: [
          { x: 50, y: 0 },
          { x: 0, y: 100 },
          { x: 100, y: 100 },
        ],
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fillColor: "#d9d9d9",
        borderColor: "transparent",
      };
      break;
    case "Square":
      defaultObjectProperties.Square = {
        fillColor: "#d9d9d9",
        borderColor: "transparent",
      };
      break;
    case "Textbox":
      defaultObjectProperties.Textbox = {
        content: "New Textbox",
        fontSize: 14,
        textAlign: "left",
        fontFamily: "Arial",
        fontStyle: "normal",
        innerColor: "#d9d9d9",
        borderColor: "transparent",
      };
      break;
    case "Image":
      defaultObjectProperties.Image = {
        imageUrl,
        borderColor: "transparent",
      };
      break;
    default:
      return res
        .status(400)
        .json({ result: "error", message: "Invalid object type" });
  }

  try {
    const presentation = await Presentation.findById(presentation_id);
    if (!presentation) {
      return res
        .status(404)
        .json({ result: "error", message: "Presentation not found" });
    }

    const slide = presentation.slides.id(slide_id);
    if (!slide) {
      return res
        .status(404)
        .json({ result: "error", message: "Slide not found" });
    }

    slide.objects.push(defaultObjectProperties);

    await presentation.save();

    const createdObject = slide.objects[slide.objects.length - 1];

    slide.zIndexSequence.push(createdObject._id.toString());

    await presentation.save();

    res.json({
      result: "success",
      message: "Object successfully created",
      object: defaultObjectProperties,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllObjects(req, res, next) {
  const { presentation_id, slide_id } = req.params;

  try {
    const presentation = await Presentation.findById(presentation_id);
    if (!presentation) {
      return res
        .status(404)
        .json({ result: "error", message: "Presentation not found" });
    }

    const slide = presentation.slides.id(slide_id);
    if (!slide) {
      return res
        .status(404)
        .json({ result: "error", message: "Slide not found" });
    }

    res.json({
      result: "success",
      message: "Objects successfully retrieved",
      objects: slide.objects,
    });
  } catch (err) {
    next(err);
  }
}

async function getObject(req, res, next) {
  const { presentation_id, slide_id, object_id } = req.params;

  try {
    const presentation = await Presentation.findById(presentation_id);
    if (!presentation) {
      return res
        .status(404)
        .json({ result: "error", message: "Presentation not found" });
    }

    const slide = presentation.slides.id(slide_id);
    if (!slide) {
      return res
        .status(404)
        .json({ result: "error", message: "Slide not found" });
    }

    const object = slide.objects.id(object_id);
    if (!object) {
      return res
        .status(404)
        .json({ result: "error", message: "Object not found" });
    }

    res.json({
      result: "success",
      message: "Object successfully retrieved",
      object,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteObject(req, res, next) {
  const { presentation_id, slide_id, object_id } = req.params;
  try {
    const presentation = await Presentation.findById(presentation_id);
    if (!presentation) {
      return res
        .status(404)
        .json({ result: "error", message: "Presentation not found" });
    }
    const slide = presentation.slides.id(slide_id);
    if (!slide) {
      return res
        .status(404)
        .json({ result: "error", message: "Slide not found" });
    }
    const object = slide.objects.id(object_id);
    if (!object) {
      return res
        .status(404)
        .json({ result: "error", message: "Object not found" });
    }

    slide.zIndexSequence = slide.zIndexSequence.filter(
      id => id.toString() !== object_id,
    );
    slide.animationSequence = slide.animationSequence.filter(
      animation => animation.objectId.toString() !== object_id,
    );

    slide.objects = slide.objects.map(obj =>
      obj._id.toString() === object_id ? null : obj,
    );

    slide.objects = slide.objects.filter(obj => obj !== null);

    await presentation.save();
    res.json({
      result: "success",
      message: "Object successfully deleted",
    });
  } catch (err) {
    next(err);
  }
}

async function updateObject(req, res, next) {
  const { presentation_id, slide_id, object_id } = req.params;
  const updateData = req.body;

  try {
    const presentation = await Presentation.findById(presentation_id);
    if (!presentation) {
      return res
        .status(404)
        .json({ result: "error", message: "Presentation not found" });
    }

    const slide = presentation.slides.id(slide_id);
    if (!slide) {
      return res
        .status(404)
        .json({ result: "error", message: "Slide not found" });
    }

    const object = slide.objects.id(object_id);
    if (!object) {
      return res
        .status(404)
        .json({ result: "error", message: "Object not found" });
    }

    _.merge(object, updateData);

    await presentation.save();

    res.json({
      result: "success",
      message: "Object successfully updated",
      object,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createObject,
  getObject,
  getAllObjects,
  updateObject,
  deleteObject,
};
