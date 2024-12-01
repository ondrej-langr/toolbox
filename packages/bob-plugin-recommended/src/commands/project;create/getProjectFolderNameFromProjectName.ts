export const getProjectFolderNameFromProjectName = (
  projectName: string,
) => {
  if (projectName.length === 0) {
    throw new Error(
      'Cannot create project foldername from empty string',
    );
  }

  return projectName.split('/').at(-1)!;
};
