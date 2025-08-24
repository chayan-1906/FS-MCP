import { Router } from "express";
import { serveFavIconController, serveInputController } from "../controllers/WebController";

const router = Router();

router.get('/', serveInputController);
router.get('/favicon', serveFavIconController);

export default router;
