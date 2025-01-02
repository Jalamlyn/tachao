import { AppCodeStore, Version } from "../types"

export function validateModuleExports(this: AppCodeStore, version: Version): string[] {
  const errors: string[] = []
  const exportedModules = new Set<string>()

  for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
    const code = moduleWrapper.data.code
    const exportMatch = code.match(/wpm\.export\(['"](.*?)['"]/g)
    if (exportMatch) {
      exportMatch.forEach((match) => {
        const moduleName = match.match(/wpm\.export\(['"](.*?)['"]/)![1]
        exportedModules.add(moduleName)
      })
    }
  }

  for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
    const code = moduleWrapper.data.code
    const importMatch = code.match(/wpm\.import\(['"](.*?)['"]\)/g)
    if (importMatch) {
      importMatch.forEach((match) => {
        const moduleName = match.match(/wpm\.import\(['"](.*?)['"]/)![1]
        if (!exportedModules.has(moduleName)) {
          errors.push(`Module "${moduleId}" imports "${moduleName}" but "${moduleName}" has not been exported`)
        }
      })
    }
  }

  return errors
}

export function processModuleErrors(
  this: AppCodeStore,
  errors: string[]
): { missingModules: string[]; dependentModules: string[] } {
  const missingModules: string[] = []
  const dependentModules: string[] = []

  errors.forEach((error) => {
    const match = error.match(/Module "(.*?)" imports "(.*?)" but/)
    if (match) {
      dependentModules.push(match[1])
      missingModules.push(match[2])
    }
  })

  return {
    missingModules: [...new Set(missingModules)],
    dependentModules: [...new Set(dependentModules)],
  }
}

export function validateModuleDependencies(this: AppCodeStore, version: Version): string[] {
  const errors: string[] = []
  const moduleIds = new Set(Object.keys(version.modules))

  for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
    const code = moduleWrapper.data.code
    const importRegex = /wpm\.import\(['"](.*?)['"]\)/g
    let match

    while ((match = importRegex.exec(code)) !== null) {
      const dependencyId = match[1]

      if (!moduleIds.has(dependencyId)) {
        errors.push(`Module ${moduleId} depends on non-existent module ${dependencyId}`)
      }

      const dependencyCode = version.modules[dependencyId]?.data.code
      if (dependencyCode?.includes(`wpm.import('${moduleId}')`)) {
        errors.push(`Circular dependency detected between ${moduleId} and ${dependencyId}`)
      }
    }
  }

  return errors
}