import { Router } from "express";
import { serveFavIconController, serveHomePageController, serveInputController } from "../controllers/WebController";

const router = Router();

router.get('/', serveHomePageController);
router.get('/manage-permissions', serveInputController);
router.get('/favicon', serveFavIconController);

export default router;
