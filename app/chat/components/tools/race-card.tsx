"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Trophy } from "lucide-react";

interface RaceCardProps {
    raceName: string;
    circuit: string;
    location: string;
    date: string;
    time: string;
}

export function RaceCard({ raceName, circuit, location, date, time }: RaceCardProps) {
    return (
        <Card className="w-full max-w-xs bg-linear-to-br from-red-600/10 to-orange-600/10 border-red-500/20 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-400">
                    <Trophy className="w-4 h-4" /> Next F1 Race
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <h4 className="font-bold text-lg leading-tight">{raceName}</h4>
                    <p className="text-xs text-muted-foreground">{circuit}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <span className="font-medium">{location}</span>
                </div>
                <div className="bg-background/40 p-3 rounded-xl flex justify-between items-center text-sm border border-white/5">
                    <span className="font-mono text-foreground font-semibold uppercase">{date}</span>
                    <span className="font-mono text-red-400 font-bold">{time?.replace('Z', '')} UTC</span>
                </div>
            </CardContent>
        </Card>
    );
}
