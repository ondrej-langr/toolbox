import {
  Button,
  Callout,
  Dialog,
  Flex,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useEvolu } from '../hooks/useEvolu';
import type { Project } from '../utils/getProjects';

const validateProjectName = ({
  projects,
  name,
  currentProjectId,
}: {
  projects: readonly Project[];
  name: string;
  currentProjectId?: Project['id'];
}) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { error: 'Project name cannot be empty.' };
  }

  const normalizedName = trimmedName.toLowerCase();
  const hasDuplicate = projects.some(
    (project) =>
      project.id !== currentProjectId &&
      project.name.trim().toLowerCase() === normalizedName,
  );

  if (hasDuplicate) {
    return { error: 'Project name must be unique.' };
  }

  return { name: trimmedName };
};

export const ProjectsDialog = ({
  projects,
  trigger,
}: {
  projects: readonly Project[];
  trigger: ReactNode;
}) => {
  const evolu = useEvolu();
  const createInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<
    string | null
  >(null);

  return (
    <Dialog.Root
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setValidationError(null);
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Content size="4">
        <Dialog.Title>Projects</Dialog.Title>
        <Dialog.Description>
          Create projects for new worklogs or rename existing
          ones.
        </Dialog.Description>

        <Flex direction="column" gap="4" mt="4">
          {validationError && (
            <Callout.Root color="red" variant="soft">
              <Callout.Text>{validationError}</Callout.Text>
            </Callout.Root>
          )}

          {projects.length === 0 ? (
            <Text color="gray" size="2">
              No projects yet.
            </Text>
          ) : (
            <Flex direction="column" gap="3">
              {projects.map((project) => (
                <form
                  key={project.id}
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const formData = new FormData(
                      event.currentTarget,
                    );
                    const validatedName = validateProjectName({
                      projects,
                      name:
                        formData.get('name')?.toString() ?? '',
                      currentProjectId: project.id,
                    });

                    if ('error' in validatedName) {
                      setValidationError(validatedName.error);
                      return;
                    }

                    const result = evolu.update('project', {
                      id: project.id,
                      name: validatedName.name,
                    });

                    if (!result.ok) {
                      setValidationError(String(result.error));
                      return;
                    }

                    setValidationError(null);
                  }}
                >
                  <Flex gap="2">
                    <TextField.Root
                      name="name"
                      defaultValue={project.name}
                      style={{ width: '100%' }}
                    />
                    <Button type="submit">Rename</Button>
                  </Flex>
                </form>
              ))}
            </Flex>
          )}

          <Separator size="4" />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const formData = new FormData(event.currentTarget);
              const validatedName = validateProjectName({
                projects,
                name: formData.get('name')?.toString() ?? '',
              });

              if ('error' in validatedName) {
                setValidationError(validatedName.error);
                return;
              }

              const result = evolu.insert('project', {
                name: validatedName.name,
              });

              if (!result.ok) {
                setValidationError(String(result.error));
                return;
              }

              if (createInputRef.current) {
                createInputRef.current.value = '';
              }
              setValidationError(null);
            }}
          >
            <Flex gap="2">
              <TextField.Root
                ref={createInputRef}
                name="name"
                placeholder="Project name"
                style={{ width: '100%' }}
              />
              <Button type="submit">Add project</Button>
            </Flex>
          </form>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
