const express = require("express");
const {
  listJobs,
  showNewJob,
  showEditJob,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobs");

const router = express.Router();

router.get("/", listJobs);
router.post("/", createJob);
router.get("/new", showNewJob);
router.get("/edit/:id", showEditJob);
router.post("/update/:id", updateJob);
router.post("/delete/:id", deleteJob);

module.exports = router;
