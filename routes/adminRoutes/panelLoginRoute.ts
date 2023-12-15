import express from 'express';
import {
  createRole,
  updateRole,
  deleteRole,
  getAllRoles,
} from '../../controllers/adminRoleControllers';
import {
  assignUserToRole,
  getUsersByRole,
  removeUserFromRole,
} from '../../controllers/adminUserRoleControllers';
import { getRoleByNameOrId } from '../../helpers/helpers';

const router = express.Router();

router.get('/all-roles', getAllRoles);
router.post('/', createRole);
router.post('/:roleId', updateRole);
router.delete('/:roleId', deleteRole);
router.post('/:roleId/:userId', assignUserToRole);
router.get('/:roleId/users', getUsersByRole);
router.delete('/:roleId/:userId', removeUserFromRole);
router.get('/:roleId', getRoleByNameOrId);

export default router;
