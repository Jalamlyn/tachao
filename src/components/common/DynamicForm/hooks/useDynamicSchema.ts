import { useMemo } from "react"
import { z } from "zod"
import { DynamicFormConfig } from "../types"
import { generateDynamicSchema } from "../utils/fieldUtils"

export const useDynamicSchema = (config: DynamicFormConfig) => {
  const schema = useMemo(() => {
    return generateDynamicSchema(config)
  }, [config])

  return schema
}
