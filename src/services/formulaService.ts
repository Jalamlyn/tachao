import formulajs from 'formulajs';

export class FormulaService {
  private static instance: FormulaService;

  private constructor() {
    // 初始化，可能包括加载自定义函数等
  }

  public static getInstance(): FormulaService {
    if (!FormulaService.instance) {
      FormulaService.instance = new FormulaService();
    }
    return FormulaService.instance;
  }

  public evaluateFormula(formula: string, row: Record<string, any>): { value: any; error?: string } {
    try {
      // 使用 Function 构造器创建一个函数，这样可以访问 row 中的所有字段
      const formulaFunction = new Function('row', 'formulajs', `return ${formula}`);
      const value = formulaFunction(row, formulajs);
      return { value };
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return { value: undefined, error: error.message };
    }
  }

  private validateFormula(formula: string): boolean {
    // 实现基本的安全检查，例如禁止某些危险的 JavaScript 函数
    const dangerousFunctions = ['eval', 'Function', 'setTimeout', 'setInterval'];
    return !dangerousFunctions.some(func => formula.includes(func));
  }

  public safeEvaluateFormula(formula: string, row: Record<string, any>): { value: any; error?: string } {
    if (!this.validateFormula(formula)) {
      return { value: undefined, error: 'Formula contains unauthorized functions' };
    }
    return this.evaluateFormula(formula, row);
  }
}

export const formulaService = FormulaService.getInstance();