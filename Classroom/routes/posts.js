const express = require("express");
const router = express.Router();


// POSTS ROUTE

//Index -Posts
router.get("/",(req,res) => {
    res.send("GET for posts");
});

//Show-Posts
router.get("/:id",(req,res) => {
    res.send("POST for posts id");
});

//POST-Users
router.post("/" ,(req,res) => {
    res.send("POST for posts");
});

//DELETE-Users
router.delete("/:id", (req,res) => {
    res.send("DELETE for posts id");
});

module.exports = router;