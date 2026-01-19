import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

const PaymentSuccessToast = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const tripId = searchParams.get("tripId");

    if (paymentStatus === "success") {
      toast.success("تم الدفع بنجاح!", {
        description: "شكراً لك، تم استلام دفعتك",
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        duration: 5000,
      });
      
      // Clean up URL params
      searchParams.delete("payment");
      searchParams.delete("tripId");
      setSearchParams(searchParams);
    } else if (paymentStatus === "cancelled") {
      toast.error("تم إلغاء الدفع", {
        description: "لم يتم خصم أي مبلغ من حسابك",
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      });
      
      searchParams.delete("payment");
      searchParams.delete("tripId");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return null;
};

export default PaymentSuccessToast;
