import metaVisionMatrix from './specs/meta.vision_matrix.json';
import metaEntity from './specs/meta.entity.json';
import metaUi from './specs/meta.ui.json';
import metaLink from './specs/meta.link.json';
import metaWorkflow from './specs/meta.workflow.json';
import metaUserData from './specs/meta.user_data.json';

export const METASCHEMAS = {
  visionMatrix: metaVisionMatrix,
  entity: metaEntity,
  ui: metaUi,
  link: metaLink,
  workflow: metaWorkflow,
  userData: metaUserData
} as const;