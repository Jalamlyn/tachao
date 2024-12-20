// Babel 模块
let babelModule: typeof import("@babel/standalone") | null = null;

export const preloadBabel = async () => {
  if (!babelModule) {
    babelModule = await import("@babel/standalone");
    console.log("[Babel] Module loaded successfully");
  }
  return babelModule;
};

export const transform = (code: string, options: any = {}) => {
  if (!babelModule) {
    throw new Error("Babel module not loaded. Please wait for application initialization.");
  }
  return babelModule.transform(code, options);
};

// Tokenizer 模块
let tokenModule: typeof import("gpt-tokenizer/model/gpt-4o") | null = null;

export const preloadTokenizer = async () => {
  if (!tokenModule) {
    tokenModule = await import("gpt-tokenizer/model/gpt-4o");
    console.log("[Tokenizer] Module loaded successfully");
  }
  return tokenModule;
};

export const countTokens = (text: string): number => {
  if (!tokenModule) {
    throw new Error("Tokenizer module not loaded. Please wait for application initialization.");
  }
  return tokenModule.countTokens(text);
};

// 模块加载状态
export const isModulesLoaded = () => babelModule !== null && tokenModule !== null;