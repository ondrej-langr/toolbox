/* eslint-disable unicorn/prevent-abbreviations -- follows npm naming convention */
import type { PackageJson } from '@ondrej-langr/zod-package-json';
import { cloneDeep, merge } from 'es-toolkit';
import { forEach } from 'es-toolkit/compat';
import semver from 'semver';

type Dependencies = PackageJson['dependencies'];

const PACKAGE_MANAGER_NAME_VERSION_SEPARATOR = '@';
const PACKAGE_MANAGER_VERSION_ALLOWED_RANGE: '' | '^' | '~' =
  '^';

const correctDependencyVersions = (
  currentDependencies: Dependencies,
  newPartial: Dependencies,
): NonNullable<Dependencies> => {
  const result = { ...currentDependencies };
  const managedDependencies = Object.entries(newPartial ?? {});

  forEach(
    managedDependencies,
    ([dependencyName, requiredDependencyVersion]) => {
      const previousDependencyVersion =
        currentDependencies?.[dependencyName] ??
        requiredDependencyVersion;

      const previousSatisfiesRangeAndIsValid = semver.satisfies(
        previousDependencyVersion.replaceAll(/[=^>~]/g, ''),
        requiredDependencyVersion
          .replaceAll('=', '')
          .replace('>', '^'),
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- at this point it should be defined
      result[dependencyName] = previousSatisfiesRangeAndIsValid
        ? previousDependencyVersion
        : requiredDependencyVersion;
    },
  );

  return result;
};

export type ApplyPackageJsonTemplateOptions = {
  templatePackageJson: Partial<PackageJson>;
  userPackageJson: PackageJson;
};

/**
 * Takes {@link ApplyPackageJsonTemplateOptions.templatePackageJson | template package.json} value and applies it to {@link ApplyPackageJsonTemplateOptions.userPackageJson | current user package.json}.
 * In case of versions of any dependency (even engines) it applies merging logic that takes defined range (if any) from version of dependency and compares it to current user package.json of the same dependecy.
 * If it will not comply the template version is applied - othervise it leaves user with their version. This allows for smoother UX
 */
export const applyPackageJsonTemplate = ({
  templatePackageJson,
  userPackageJson,
}: ApplyPackageJsonTemplateOptions): PackageJson => {
  const result = merge(
    cloneDeep(userPackageJson),
    cloneDeep(templatePackageJson),
  );
  const currentDependencies = userPackageJson.dependencies;
  const nextDependenciesOverride =
    templatePackageJson.dependencies;

  if (
    currentDependencies &&
    Object.keys(nextDependenciesOverride ?? {}).length > 0
  ) {
    result.dependencies = correctDependencyVersions(
      currentDependencies,
      nextDependenciesOverride,
    );
  }

  const currentDevDependencies = userPackageJson.devDependencies;
  const nextDevDependenciesOverride =
    templatePackageJson.devDependencies;
  if (
    currentDevDependencies &&
    Object.keys(nextDevDependenciesOverride ?? {}).length > 0
  ) {
    result.devDependencies = correctDependencyVersions(
      currentDevDependencies,
      nextDevDependenciesOverride,
    );
  }

  const currentEngines = templatePackageJson.engines;
  const nextEnginesOverride = userPackageJson.engines;
  if (
    currentEngines &&
    Object.keys(nextEnginesOverride ?? {}).length > 0
  ) {
    result.engines = correctDependencyVersions(
      currentEngines,
      nextEnginesOverride,
    );
  }

  // Allow engine versions in range
  const currentPackageManager = userPackageJson.packageManager;
  const nextPackageManagerOverride =
    templatePackageJson.packageManager;
  if (currentPackageManager && nextPackageManagerOverride) {
    // Set required package by template
    // However later on it will be adjusted if current satisfies version by template. Meaning that user can define other version if it fall into same major semver version
    result.packageManager = nextPackageManagerOverride;

    const [
      currentPackageManagerName,
      currentPackageManagerVersion,
    ] = currentPackageManager.split(
      PACKAGE_MANAGER_NAME_VERSION_SEPARATOR,
    );

    const [
      requiredPackageManager,
      minimalRequiredPackageManagerVersion,
    ] = nextPackageManagerOverride.split(
      PACKAGE_MANAGER_NAME_VERSION_SEPARATOR,
    );

    if (currentPackageManagerName === requiredPackageManager) {
      const previousSatisfiesRangeAndIsValid = semver.satisfies(
        currentPackageManagerVersion,
        // We allow users to use any version upwards in current major we define
        `${PACKAGE_MANAGER_VERSION_ALLOWED_RANGE}${minimalRequiredPackageManagerVersion}`,
      );

      if (previousSatisfiesRangeAndIsValid) {
        result.packageManager = `${currentPackageManagerName}${PACKAGE_MANAGER_NAME_VERSION_SEPARATOR}${currentPackageManagerVersion}`;
      }
    }
  }

  return result;
};
