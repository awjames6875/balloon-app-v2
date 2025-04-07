import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Type definitions
interface BalloonOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unavailableItems?: Array<{
    color: string;
    size: string;
    required: number;
    available: number;
  }>;
  designId?: number;
  onOrderComplete?: () => void;
}

// Form schema
const orderSchema = z.object({
  color: z.string().min(1, "Please pick a color"),
  size: z.enum(["11inch", "16inch"], {
    required_error: "Please select a balloon size",
  }),
  quantity: z.coerce
    .number()
    .min(1, "You need at least 1 balloon")
    .max(100, "That's a lot of balloons! Maximum is 100"),
  eventName: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const colorOptions = [
  { value: "red", label: "Red", emoji: "🔴" },
  { value: "blue", label: "Blue", emoji: "🔵" },
  { value: "green", label: "Green", emoji: "🟢" },
  { value: "yellow", label: "Yellow", emoji: "🟡" },
  { value: "purple", label: "Purple", emoji: "🟣" },
  { value: "pink", label: "Pink", emoji: "🎀" },
  { value: "orange", label: "Orange", emoji: "🟠" },
  { value: "white", label: "White", emoji: "⚪" },
  { value: "black", label: "Black", emoji: "⚫" },
];

export function BalloonOrderDialog({
  open,
  onOpenChange,
  unavailableItems = [],
  designId,
  onOrderComplete,
}: BalloonOrderDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Set up form with validation
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      color: unavailableItems.length > 0 ? unavailableItems[0].color : "red",
      size: unavailableItems.length > 0 
        ? unavailableItems[0].size 
        : "11inch",
      quantity: unavailableItems.length > 0 
        ? Math.max(unavailableItems[0].required - unavailableItems[0].available, 1)
        : 1,
      eventName: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: OrderFormValues) => {
    setIsLoading(true);
    try {
      // Send order to API
      const response = await apiRequest("/api/orders/balloon", {
        method: "POST",
        data: {
          ...data,
          designId: designId || null,
        },
      });

      // Show confirmation
      setOrderDetails(response);
      setOrderComplete(true);
      
      toast({
        title: "Order placed successfully! 🎈",
        description: "You'll get your balloons soon!",
      });
      
      if (onOrderComplete) {
        onOrderComplete();
      }
    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Oops! Something went wrong",
        description: "We couldn't complete your balloon order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the dialog state when it's closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOrderComplete(false);
      setOrderDetails(null);
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!orderComplete ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                Order Balloons 🎈
              </DialogTitle>
              <DialogDescription>
                Tell us what kind of balloons you need for your design!
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What color balloons do you want?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.emoji} {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What size balloons?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="11inch">Small (11 inch)</SelectItem>
                          <SelectItem value="16inch">Large (16 inch)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many balloons?</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose between 1 and 100 balloons
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your event? (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Birthday party, graduation, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This helps us know what the balloons are for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Ordering..." : "Order Balloons 🎈"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <span className="text-xl">🎉</span> Order Complete!
              </DialogTitle>
              <DialogDescription>
                Your balloons have been ordered!
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">Order Summary:</h3>
                <p>
                  <span className="font-medium">Color:</span>{" "}
                  {colorOptions.find(c => c.value === orderDetails?.color)?.emoji}{" "}
                  {orderDetails?.color}
                </p>
                <p>
                  <span className="font-medium">Size:</span>{" "}
                  {orderDetails?.size === "11inch" ? "Small (11 inch)" : "Large (16 inch)"}
                </p>
                <p>
                  <span className="font-medium">Quantity:</span> {orderDetails?.quantity} balloons
                </p>
                {orderDetails?.total && (
                  <p>
                    <span className="font-medium">Total:</span> {orderDetails.total}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}