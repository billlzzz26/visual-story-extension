import type { NextConfig } from "next";

const config: NextConfig = {
	serverExternalPackages: [],
 allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS
     ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
     : [],
};
export default config;
