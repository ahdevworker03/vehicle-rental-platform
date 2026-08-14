import { Router, type IRouter } from "express";
import {
  register,
  login,
  refresh,
  logout,
  currentUser,
} from "./auth.controller";
import { validateBody } from "../../middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.validation";

const router: IRouter = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.post("/logout", validateBody(logoutSchema), logout);
router.get("/me", currentUser);

export default router;
