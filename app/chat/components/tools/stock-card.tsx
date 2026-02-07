"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { DollarSign } from "lucide-react";
import { cn } from "@/common/lib/utils";

interface StockCardProps {
    symbol: string;
    price: string;
    change: string;
}

export function StockCard({ symbol, price, change }: StockCardProps) {
    const isPositive = change?.startsWith('+') || parseFloat(change) > 0;

    return (
        <Card className="w-full max-w-xs bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-400">
                    <DollarSign className="w-4 h-4" /> Stock Price
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-muted-foreground">{symbol}</span>
                        <span className="text-3xl font-bold mt-1">${parseFloat(price).toFixed(2)}</span>
                    </div>
                    <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-bold shadow-sm",
                        isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                        {change}
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-right uppercase tracking-wider">Real-time Data</p>
            </CardContent>
        </Card>
    );
}
