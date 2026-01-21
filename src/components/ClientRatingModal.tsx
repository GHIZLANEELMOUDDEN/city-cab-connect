import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useClientRating } from "@/hooks/useClientRating";

interface ClientRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  clientId?: string | null;
  clientName?: string;
}

const ClientRatingModal = ({
  isOpen,
  onClose,
  tripId,
  clientId,
  clientName = "العميل",
}: ClientRatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const { submitClientRating, loading } = useClientRating({ tripId, clientId });

  const handleSubmit = async () => {
    if (rating === 0) return;

    const success = await submitClientRating(rating, comment);
    if (success) {
      setRating(0);
      setComment("");
      onClose();
    }
  };

  const displayRating = hoveredRating || rating;

  const getRatingText = (r: number) => {
    switch (r) {
      case 1:
        return "سيء جداً";
      case 2:
        return "سيء";
      case 3:
        return "متوسط";
      case 4:
        return "جيد";
      case 5:
        return "ممتاز";
      default:
        return "اختر تقييمك";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">قيّم العميل</DialogTitle>
          <DialogDescription className="text-center">
            كيف كانت تجربتك مع {clientName}؟
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Text */}
          <p className="text-center text-lg font-medium mb-6">
            {getRatingText(displayRating)}
          </p>

          {/* Comment */}
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أضف تعليقاً (اختياري)"
            className="resize-none"
            rows={3}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            لاحقاً
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || loading}>
            {loading ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientRatingModal;
