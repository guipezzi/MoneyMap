export interface CategorySummary {
    category_id: number;
    category_name: string;
    category_color: string;
    total: number;
}

export interface MonthlyEvolution {
    month: string; // formato "YYYY-MM"
    income: number;
    expense: number;
}

export interface DashboardSummary {
    total_income: number;
    total_expense: number;
    balance: number;
    by_category: CategorySummary[];
    monthly_evolution: MonthlyEvolution[];
}