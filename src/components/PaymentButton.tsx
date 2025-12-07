import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";

interface PaymentButtonProps {
  tripId: string;
  amount: number;
  description?: string;
  className?: string;
}

const PaymentButton = ({ tripId, amount, description, className }: PaymentButtonProps) => {
  const { initiatePayment, loading } = usePayment();

  const handlePayment = async () => {
    await initiatePayment({ tripId, amount, description });
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          جاري التحميل...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 ml-2" />
          الدفع بالبطاقة
        </>
      )}
    </Button>
  );
};

export default PaymentButton;
