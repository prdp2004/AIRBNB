const express = require("express");
const router = express.Router();


// USER Routes

//Index -Users
router.get("/",(req,res) => {
    res.send("GET for users");
});

//Show-User
router.get("/:id",(req,res) => {
    res.send("POST for Users id");
});

//POST-Users
router.post("/" ,(req,res) => {
    res.send("POST for Users");
});

//DELETE-Users
router.delete("/:id", (req,res) => {
    res.send("DELETE for USers id");
});

module.exports = router;