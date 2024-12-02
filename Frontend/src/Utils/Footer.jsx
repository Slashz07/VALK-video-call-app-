// File: src/components/Footer.jsx
import React from "react";
import { Box, Typography, Link, IconButton } from "@mui/material";
import { Facebook, Twitter, Instagram } from "@mui/icons-material";

const Footer = () => {
  return (
    <div className="footer">
 <Box
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        py: 3,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Logo and Description */}
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#FFC107" }}
        >
          VALK
        </Typography>
        <Typography variant="body2" sx={{ color: "#aaa", mt: 1 }}>
          Cover the distance with VALK, your reliable video calling solution.
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Link
          href="#about"
          underline="hover"
          sx={{ color: "#aaa", "&:hover": { color: "#FFC107" } }}
        >
          About
        </Link>
        <Link
          href="#privacy"
          underline="hover"
          sx={{ color: "#aaa", "&:hover": { color: "#FFC107" } }}
        >
          Privacy Policy
        </Link>
        <Link
          href="#contact"
          underline="hover"
          sx={{ color: "#aaa", "&:hover": { color: "#FFC107" } }}
        >
          Contact Us
        </Link>
      </Box>

      {/* Social Media Icons */}
      <Box sx={{ display: "flex" }}>
        <IconButton
          href="#"
          sx={{ color: "#aaa", "&:hover": { color: "#FFC107" } }}
        >
          <Facebook />
        </IconButton>
        <IconButton
          href="#"
          sx={{ color: "#aaa", "&:hover": { color: "#FFC107" } }}
        >
          <Twitter />
        </IconButton>
        <IconButton
          href="#"
          sx={{ color: "#aaa", "&:hover": { color: "#FFC107" } }}
        >
          <Instagram />
        </IconButton>
      </Box>

      {/* Copyright Text */}
      <Typography variant="body2" sx={{ color: "#555", mb: 2 }}>
        &copy; {new Date().getFullYear()} VALK. All rights reserved.
      </Typography>
    </Box>
    </div>
   
  );
};

export default Footer;
