import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X, Check, Loader2 } from "lucide-react";

interface CouponInputProps {
  orderAmount: number;
  onApply: (code: string, orderAmount: number) => Promise<boolean>;
  onClear: () => void;
  appliedCode?: string | null;
  loading?: boolean;
  discount?: number;
}

const CouponInput = ({
  orderAmount,
  onApply,
  onClear,
  appliedCode,
  loading = false,
  discount = 0,
}: CouponInputProps) => {
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsApplying(true);
    const success = await onApply(code.trim(), orderAmount);
    if (success) {
      setCode("");
    }
    setIsApplying(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  if (appliedCode) {
    return (
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-accent" />
          <div>
            <span className="font-medium text-accent">{appliedCode}</span>
            <span className="text-sm text-muted-foreground mr-2">
              (-{discount.toLocaleString('ar-IQ')} دينار)
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onClear}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="أدخل كود الخصم"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          className="pr-10"
          disabled={loading || isApplying}
        />
      </div>
      <Button
        variant="outline"
        onClick={handleApply}
        disabled={!code.trim() || loading || isApplying}
      >
        {isApplying || loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "تطبيق"
        )}
      </Button>
    </div>
  );
};

export default CouponInput;
