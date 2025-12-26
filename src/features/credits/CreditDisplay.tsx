import React, { useState } from "react";
import { useSelector } from "@xstate/react";
import { creditActor } from "./creditMachine";
import { PaymentModal } from "../payment/PaymentModal";
import { Coins } from "lucide-react";

// ... (props interface if needed, but not here)

export const CreditDisplay: React.FC = () => {
  const credits = useSelector(creditActor, (s) => s.context.credits);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-2 bg-gray-100/80 px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
          <Coins className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-gray-900">{credits}</span>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
