import { DEFAULT_NODE_VERSION } from '../../../constants/base.js';
import { TemplateFile } from '../../../TemplateFile.js';

export default TemplateFile.define('text', () => String(DEFAULT_NODE_VERSION));
