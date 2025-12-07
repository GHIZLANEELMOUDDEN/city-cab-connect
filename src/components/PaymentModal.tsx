import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Loader2, CheckCircle2 } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import { formatPrice } from "@/lib/priceCalculator";
import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCashPayment: () => void;
  tripId: string;
  amount: number;
  tripDetails?: {
    pickupAddress: string;
    dropoffAddress?: string;
    distanceKm?: number;
  };
}

const PaymentModal = ({
  isOpen,
  onClose,
  onCashPayment,
  tripId,
  amount,
  tripDetails,
}: PaymentModalProps) => {
  const { initiatePayment, loading } = usePayment();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | null>(null);

  const handleCardPayment = async () => {
    setPaymentMethod("card");
    const result = await initiatePayment({
      tripId,
      amount,
      description: tripDetails?.pickupAddress
        ? `رحلة من ${tripDetails.pickupAddress}${tripDetails.dropoffAddress ? ` إلى ${tripDetails.dropoffAddress}` : ""}`
        : undefined,
    });
    
    if (result.success) {
      onClose();
    }
    setPaymentMethod(null);
  };

  const handleCashPayment = () => {
    setPaymentMethod("cash");
    onCashPayment();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">اختر طريقة الدفع</DialogTitle>
          <DialogDescription className="text-center">
            قم باختيار طريقة الدفع المناسبة لك
          </DialogDescription>
        </DialogHeader>

        {/* Trip Summary */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">المبلغ الإجمالي</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(amount)}</span>
          </div>
          {tripDetails && (
            <>
              {tripDetails.pickupAddress && (
                <div className="text-sm">
                  <span className="text-muted-foreground">من: </span>
                  <span>{tripDetails.pickupAddress}</span>
                </div>
              )}
              {tripDetails.dropoffAddress && (
                <div className="text-sm">
                  <span className="text-muted-foreground">إلى: </span>
                  <span>{tripDetails.dropoffAddress}</span>
                </div>
              )}
              {tripDetails.distanceKm && (
                <div className="text-sm">
                  <span className="text-muted-foreground">المسافة: </span>
                  <span>{tripDetails.distanceKm} كم</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment Options */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={handleCardPayment}
            disabled={loading}
          >
            {loading && paymentMethod === "card" ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <CreditCard className="w-8 h-8 text-primary" />
            )}
            <span className="font-medium">بطاقة ائتمان</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex-col gap-2 border-2 hover:border-accent hover:bg-accent/5 transition-all"
            onClick={handleCashPayment}
            disabled={loading}
          >
            <Banknote className="w-8 h-8 text-accent" />
            <span className="font-medium">نقداً</span>
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>دفع آمن ومشفر</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
