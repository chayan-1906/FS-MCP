import { Router } from "express";
import {
    getConfigFilePathController,
    getSystemInfoController,
    initializeConfigController,
    modifyFileController,
    readFileController,
} from "../controllers/SystemController";

const router = Router();

router.get('/system-info', getSystemInfoController);
router.get('/config-file-path', getConfigFilePathController);
router.post('/config-file-path', getConfigFilePathController);
router.post('/initialize-config', initializeConfigController);
router.post('/read-file', readFileController);
router.put('/modify-file', modifyFileController);

export default router;
