import { TemplateFile } from '../../../TemplateFile.js';
import { DEFAULT_NODE_VERSION } from '../../../constants.js';

export default TemplateFile.define('text', () => String(DEFAULT_NODE_VERSION));
