"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Wifi, Banknote } from "lucide-react";
import { RedeemAirtimeForm } from "./redeem-airtime-form";
import { RedeemDataForm } from "./redeem-data-form";
import { RedeemCashForm } from "./redeem-cash-form";

interface RedeemTabsProps {
  userPoints: number;
  userPhone?: string | null;
}

export function RedeemTabs({ userPoints, userPhone }: RedeemTabsProps) {
  const [tab, setTab] = useState("airtime");

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="airtime" className="gap-1.5 text-xs">
          <Phone className="h-3.5 w-3.5" />
          Airtime
        </TabsTrigger>
        <TabsTrigger value="data" className="gap-1.5 text-xs">
          <Wifi className="h-3.5 w-3.5" />
          Data
        </TabsTrigger>
        <TabsTrigger value="cash" className="gap-1.5 text-xs">
          <Banknote className="h-3.5 w-3.5" />
          Cash
        </TabsTrigger>
      </TabsList>

      <TabsContent value="airtime" className="mt-4">
        <RedeemAirtimeForm userPoints={userPoints} userPhone={userPhone} />
      </TabsContent>

      <TabsContent value="data" className="mt-4">
        <RedeemDataForm userPoints={userPoints} userPhone={userPhone} />
      </TabsContent>

      <TabsContent value="cash" className="mt-4">
        <RedeemCashForm userPoints={userPoints} />
      </TabsContent>
    </Tabs>
  );
}
