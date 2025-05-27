import {
  defineTemplateFile,
  DeleteFileTemplateResult,
} from 'tsuru';

export default defineTemplateFile(
  'text',
  () => new DeleteFileTemplateResult(),
);
