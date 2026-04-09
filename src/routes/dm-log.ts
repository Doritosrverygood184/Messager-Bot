import { Router } from "express";
import { getEntries } from "../dm-log";

const router = Router();
router.get("/dm-log", (_req, res) => { res.json(getEntries()); });
export default router;
