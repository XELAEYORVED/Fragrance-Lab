import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
  res.send("API Fragrance Lab en ligne 🌸");
});

// Récupérer tous les parfums
app.get("/api/perfumes", async (req, res) => {
  try {
    const perfumes = await prisma.perfume.findMany();
    res.json(perfumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des parfums" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});