import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  PiggyBank,
  ShoppingCart,
  AlertTriangle,
  Plus,
  Settings,
  Bell,
  Target,
  Coffee,
  Car,
  Home as HomeIcon
} from "lucide-react";

const Finance = () => {
  const [monthlyData] = useState({
    income: 5200,
    expenses: 3847,
    savings: 1353,
    budget: 4000,
    savingsGoal: 1500
  });

  const [recentTransactions] = useState([
    { id: 1, description: 'Grocery Store', amount: -87.43, category: 'Food', date: 'Today', icon: ShoppingCart },
    { id: 2, description: 'Salary Deposit', amount: 2600.00, category: 'Income', date: 'Yesterday', icon: TrendingUp },
    { id: 3, description: 'Coffee Shop', amount: -12.50, category: 'Food', date: 'Yesterday', icon: Coffee },
    { id: 4, description: 'Car Payment', amount: -320.00, category: 'Transport', date: '2 days ago', icon: Car },
    { id: 5, description: 'Rent Payment', amount: -1250.00, category: 'Housing', date: '3 days ago', icon: HomeIcon }
  ]);

  const [categories] = useState([
    { name: 'Housing', spent: 1250, budget: 1300, color: 'bg-finance' },
    { name: 'Food', spent: 387, budget: 500, color: 'bg-health' },
    { name: 'Transport', spent: 420, budget: 400, color: 'bg-calendar' },
    { name: 'Entertainment', spent: 165, budget: 200, color: 'bg-mood' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-border/50 shadow-widget">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-finance" />
              Financial Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">March 2024 overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Monthly Overview */}
        <Card className="bg-gradient-finance text-white shadow-soft border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">This Month</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold">${monthlyData.savings.toLocaleString()}</div>
                <div className="text-white/80">Saved this month</div>
                <div className="text-sm text-white/60 mt-1">
                  Goal: ${monthlyData.savingsGoal.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">{Math.round((monthlyData.expenses / monthlyData.budget) * 100)}%</div>
                <div className="text-white/80">of budget used</div>
                <Progress 
                  value={(monthlyData.expenses / monthlyData.budget) * 100} 
                  className="mt-2 bg-white/20" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-health mx-auto mb-2" />
              <div className="text-2xl font-bold text-health">${monthlyData.income.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Income</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <TrendingDown className="h-8 w-8 text-finance mx-auto mb-2" />
              <div className="text-2xl font-bold text-finance">${monthlyData.expenses.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Expenses</div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Budget Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.name}</span>
                  <div className="text-sm">
                    <span className="font-semibold">${category.spent}</span>
                    <span className="text-muted-foreground"> / ${category.budget}</span>
                  </div>
                </div>
                <Progress 
                  value={(category.spent / category.budget) * 100} 
                  className="h-2"
                />
                {category.spent > category.budget && (
                  <div className="flex items-center gap-1 text-destructive text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    Over budget by ${category.spent - category.budget}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-calendar" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((transaction) => {
              const IconComponent = transaction.icon;
              return (
                <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg ${transaction.amount > 0 ? 'bg-health' : 'bg-finance'}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{transaction.date}</span>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-health' : 'text-foreground'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Savings Goal */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              Savings Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary">
                ${monthlyData.savings.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                of ${monthlyData.savingsGoal.toLocaleString()} goal
              </div>
            </div>
            <Progress 
              value={(monthlyData.savings / monthlyData.savingsGoal) * 100} 
              className="h-3 mb-4"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {Math.round((monthlyData.savings / monthlyData.savingsGoal) * 100)}% complete
              </span>
              <span className="text-primary font-medium">
                ${monthlyData.savingsGoal - monthlyData.savings} to go
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 bg-gradient-finance hover:opacity-90">
                <div className="text-center">
                  <Plus className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Add Expense</div>
                </div>
              </Button>
              <Button className="h-16 bg-gradient-primary hover:opacity-90">
                <div className="text-center">
                  <Target className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Set Budget</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
      
      {/* Bottom padding for navigation */}
      <div className="h-20" />
    </div>
  );
};

export default Finance;