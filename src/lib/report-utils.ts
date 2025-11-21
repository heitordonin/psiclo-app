import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

export interface CategoryReport {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
  percentage: number;
  transactionCount: number;
  subcategories?: CategoryReport[];
  isFixed?: boolean;
}

export interface DREData {
  period: string;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  categories: CategoryReport[];
  monthlyAverage: number;
  biggestCategory: CategoryReport | null;
}

export interface Insight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  description: string;
  icon: string;
  value?: string;
}

const FIXED_CATEGORY_KEYWORDS = [
  'aluguel', 'condomínio', 'plano de saúde', 'assinatura', 
  'netflix', 'spotify', 'internet', 'seguro', 'telefone',
  'telefonia', 'celular', 'faculdade', 'educação'
];

export function classifyExpenseType(
  category: Category, 
  isRecurring: boolean
): 'fixed' | 'variable' {
  const categoryName = category.name.toLowerCase();
  
  // Se é recorrente E contém palavra-chave de despesa fixa
  if (isRecurring && FIXED_CATEGORY_KEYWORDS.some(keyword => 
    categoryName.includes(keyword)
  )) {
    return 'fixed';
  }
  
  return 'variable';
}

export function groupTransactionsByCategory(
  transactions: (Transaction & { budget_categories?: Category | null })[],
  categories: Category[]
): CategoryReport[] {
  const categoryMap = new Map<string, CategoryReport>();
  
  // Inicializar categorias mãe
  categories
    .filter(c => !c.parent_id)
    .forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        total: 0,
        percentage: 0,
        transactionCount: 0,
        subcategories: []
      });
    });

  // Processar transações
  transactions.forEach(transaction => {
    const category = transaction.budget_categories;
    if (!category) return;

    // Encontrar categoria mãe
    const parentId = category.parent_id || category.id;
    const parentCategory = categoryMap.get(parentId);
    if (!parentCategory) return;

    // Adicionar ao total da categoria mãe
    parentCategory.total += Math.abs(Number(transaction.amount));
    parentCategory.transactionCount += 1;

    // Se tem subcategoria, adicionar/atualizar
    if (category.parent_id) {
      let subcategory = parentCategory.subcategories?.find(s => s.id === category.id);
      if (!subcategory) {
        subcategory = {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          total: 0,
          percentage: 0,
          transactionCount: 0
        };
        parentCategory.subcategories?.push(subcategory);
      }
      subcategory.total += Math.abs(Number(transaction.amount));
      subcategory.transactionCount += 1;
    }
  });

  // Calcular percentuais
  const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);
  
  const result = Array.from(categoryMap.values())
    .filter(cat => cat.total > 0)
    .map(cat => {
      cat.percentage = total > 0 ? (cat.total / total) * 100 : 0;
      
      // Calcular percentuais das subcategorias
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories = cat.subcategories
          .filter(sub => sub.total > 0)
          .map(sub => ({
            ...sub,
            percentage: cat.total > 0 ? (sub.total / cat.total) * 100 : 0
          }))
          .sort((a, b) => b.total - a.total);
      }
      
      return cat;
    })
    .sort((a, b) => b.total - a.total);

  return result;
}

export function calculateDREData(
  transactions: (Transaction & { budget_categories?: Category | null })[],
  categories: Category[],
  periodLabel: string
): DREData {
  const categoryReports = groupTransactionsByCategory(transactions, categories);
  
  let fixedExpenses = 0;
  let variableExpenses = 0;

  // Classificar como fixas ou variáveis
  const categoriesWithType = categoryReports.map(cat => {
    const category = categories.find(c => c.id === cat.id);
    if (!category) return cat;

    // Considerar fixa se tiver subcategorias fixas ou se a maioria das transações for recorrente
    const isFixed = FIXED_CATEGORY_KEYWORDS.some(keyword => 
      cat.name.toLowerCase().includes(keyword)
    );

    if (isFixed) {
      fixedExpenses += cat.total;
    } else {
      variableExpenses += cat.total;
    }

    return { ...cat, isFixed };
  });

  const totalExpenses = fixedExpenses + variableExpenses;
  const biggestCategory = categoryReports.length > 0 ? categoryReports[0] : null;

  return {
    period: periodLabel,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    categories: categoriesWithType,
    monthlyAverage: totalExpenses,
    biggestCategory
  };
}

export function generateInsights(
  dreData: DREData,
  previousPeriodData?: DREData
): Insight[] {
  const insights: Insight[] = [];

  // Insight 1: Maior categoria
  if (dreData.biggestCategory) {
    insights.push({
      id: 'biggest-category',
      type: 'info',
      title: 'Maior Despesa',
      description: `${dreData.biggestCategory.name} representa ${dreData.biggestCategory.percentage.toFixed(0)}% dos seus gastos`,
      icon: 'TrendingUp',
      value: `${dreData.biggestCategory.percentage.toFixed(0)}%`
    });
  }

  // Insight 2: Proporção fixas/variáveis
  const fixedPercentage = dreData.totalExpenses > 0 
    ? (dreData.fixedExpenses / dreData.totalExpenses) * 100 
    : 0;
  
  if (fixedPercentage > 60) {
    insights.push({
      id: 'fixed-high',
      type: 'warning',
      title: 'Despesas Fixas Elevadas',
      description: `Suas despesas fixas representam ${fixedPercentage.toFixed(0)}% do total. Recomendado: máximo 50%`,
      icon: 'AlertCircle',
      value: `${fixedPercentage.toFixed(0)}%`
    });
  } else if (fixedPercentage >= 40 && fixedPercentage <= 60) {
    insights.push({
      id: 'fixed-balanced',
      type: 'success',
      title: 'Equilíbrio Saudável',
      description: `Suas despesas fixas (${fixedPercentage.toFixed(0)}%) estão em proporção adequada`,
      icon: 'CheckCircle',
      value: `${fixedPercentage.toFixed(0)}%`
    });
  }

  // Insight 3: Comparação com período anterior
  if (previousPeriodData) {
    const variation = dreData.totalExpenses - previousPeriodData.totalExpenses;
    const variationPercentage = previousPeriodData.totalExpenses > 0
      ? (variation / previousPeriodData.totalExpenses) * 100
      : 0;

    if (Math.abs(variationPercentage) >= 10) {
      insights.push({
        id: 'period-comparison',
        type: variationPercentage > 0 ? 'alert' : 'success',
        title: variationPercentage > 0 ? 'Gastos Aumentaram' : 'Gastos Reduziram',
        description: `Você ${variationPercentage > 0 ? 'gastou' : 'economizou'} ${Math.abs(variationPercentage).toFixed(0)}% ${variationPercentage > 0 ? 'a mais' : 'a menos'} em relação ao período anterior`,
        icon: variationPercentage > 0 ? 'TrendingUp' : 'TrendingDown',
        value: `${variationPercentage > 0 ? '+' : ''}${variationPercentage.toFixed(0)}%`
      });
    }
  }

  // Insight 4: Oportunidades de economia (categorias com alto percentual)
  const highCategories = dreData.categories.filter(cat => cat.percentage > 25 && !cat.isFixed);
  if (highCategories.length > 0) {
    const category = highCategories[0];
    insights.push({
      id: 'savings-opportunity',
      type: 'info',
      title: 'Oportunidade de Economia',
      description: `Reduza 10% em ${category.name} e economize significativamente`,
      icon: 'Target',
      value: `${category.percentage.toFixed(0)}%`
    });
  }

  return insights;
}
