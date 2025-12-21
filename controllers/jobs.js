const Job = require("../models/Job");
const parseValidationErrs = require("../utils/parseValidationErrs");

const listJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.render("jobs", { jobs });
  } catch (e) {
    next(e);
  }
};

const showNewJob = (req, res) => {
  res.render("job", { job: null });
};

const showEditJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job) {
      req.flash("error", "Job not found.");
      return res.redirect("/jobs");
    }
    res.render("job", { job });
  } catch (e) {
    next(e);
  }
};

const createJob = async (req, res, next) => {
  const { company, position, status } = req.body;
  try {
    await Job.create({
      company,
      position,
      status,
      createdBy: req.user._id,
    });
    req.flash("info", "Job created.");
    res.redirect("/jobs");
  } catch (e) {
    if (e.name === "ValidationError") {
      parseValidationErrs(e, req);
      return res.redirect("/jobs/new");
    }
    next(e);
  }
};

const updateJob = async (req, res, next) => {
  const { company, position, status } = req.body;
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { company, position, status },
      { new: true, runValidators: true }
    );
    if (!job) {
      req.flash("error", "Job not found.");
      return res.redirect("/jobs");
    }
    req.flash("info", "Job updated.");
    res.redirect("/jobs");
  } catch (e) {
    if (e.name === "ValidationError") {
      parseValidationErrs(e, req);
      return res.redirect(`/jobs/edit/${req.params.id}`);
    }
    next(e);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job) {
      req.flash("error", "Job not found.");
    } else {
      req.flash("info", "Job deleted.");
    }
    res.redirect("/jobs");
  } catch (e) {
    next(e);
  }
};

module.exports = {
  listJobs,
  showNewJob,
  showEditJob,
  createJob,
  updateJob,
  deleteJob,
};
