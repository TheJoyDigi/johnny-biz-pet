import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const sittersDir = path.join(process.cwd(), "public", "sitters");
    const sitterFolders = fs.readdirSync(sittersDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

    const photos = sitterFolders.flatMap((folder) => {
      const galleryPath = path.join(sittersDir, folder.name, "gallery");
      if (!fs.existsSync(galleryPath)) return [];

      const files = fs.readdirSync(galleryPath);
      return files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => ({
          id: `${folder.name}-${file}`,
          src: `/sitters/${folder.name}/gallery/${file}`,
          alt: file.replace(/\.[^/.]+$/, "").replace(/-/g, " "),
          width: 1200,
          height: 800,
        }));
    });

    return res.status(200).json(photos);
  } catch (error) {
    console.error("Error reading gallery directory:", error);
    return res.status(500).json({ message: "Error fetching gallery photos" });
  }
}
