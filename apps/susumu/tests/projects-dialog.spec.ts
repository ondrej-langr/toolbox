import { expect, test } from '@playwright/test';

test('creates a second project without submitting the worklog form', async ({
  page,
}) => {
  const workItemName = 'Trigger should not submit';

  await page.goto('/');

  await page.getByRole('button', { name: 'Create project' }).click();

  const firstProjectsDialog = page.getByRole('dialog', {
    name: 'Projects',
  });

  await firstProjectsDialog
    .getByPlaceholder('Project name')
    .fill('Alpha');
  await firstProjectsDialog
    .getByRole('button', { name: 'Add project' })
    .click();

  const workItemInput = page.getByPlaceholder('Name of the action');

  await expect(workItemInput).toBeVisible();
  await workItemInput.fill(workItemName);

  await page.getByRole('button', { name: 'Projects' }).click();

  const projectsDialog = page.getByRole('dialog', {
    name: 'Projects',
  });

  await expect(projectsDialog).toBeVisible();
  await expect(workItemInput).toHaveValue(workItemName);

  await projectsDialog
    .getByPlaceholder('Project name')
    .fill('Beta');
  await projectsDialog
    .getByRole('button', { name: 'Add project' })
    .click();

  await expect(workItemInput).toHaveValue(workItemName);
  await expect(
    page.getByText(workItemName, { exact: true }),
  ).toHaveCount(0);
  await expect(
    projectsDialog.getByRole('textbox').nth(0),
  ).toHaveValue('Alpha');
  await expect(
    projectsDialog.getByRole('textbox').nth(1),
  ).toHaveValue('Beta');
  await expect(
    projectsDialog.getByRole('button', { name: 'Rename' }),
  ).toHaveCount(2);
});

test('reassigns a worklog to another project from the row popover', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Create project' }).click();

  const firstProjectsDialog = page.getByRole('dialog', {
    name: 'Projects',
  });

  await firstProjectsDialog
    .getByPlaceholder('Project name')
    .fill('Alpha');
  await firstProjectsDialog
    .getByRole('button', { name: 'Add project' })
    .click();

  await page.getByRole('button', { name: 'Projects' }).click();

  const projectsDialog = page.getByRole('dialog', {
    name: 'Projects',
  });

  await projectsDialog
    .getByPlaceholder('Project name')
    .fill('Beta');
  await projectsDialog
    .getByRole('button', { name: 'Add project' })
    .click();
  await page.keyboard.press('Escape');

  const workItemInput = page.getByPlaceholder('Name of the action');

  await workItemInput.fill('Kickoff');
  await workItemInput.press('Enter');

  const workLogRow = page
    .locator('div')
    .filter({ has: page.getByText('Kickoff', { exact: true }) })
    .first();

  await expect(workLogRow.getByRole('button', { name: 'ALPHA' })).toBeVisible();
  await workLogRow.getByRole('button', { name: 'ALPHA' }).click();
  await page.getByRole('button', { name: 'BETA' }).click();

  await expect(
    page.getByText(/Working on\s+Beta\s+for/),
  ).toBeVisible();
});
