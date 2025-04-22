import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Using directly defined color and size options instead of importing from schema
const BALLOON_COLORS = ["red", "blue", "green", "yellow", "purple", "pink", "orange", "white", "black", "silver", "gold"];
const BALLOON_SIZES = ["11inch", "16inch"];

// Define the form schema for balloon orders
const balloonOrderSchema = z.object({
  color: z.enum(["red", "blue", "green", "yellow", "purple", "pink", "orange", "white", "black", "silver", "gold"] as const),
  size: z.enum(["11inch", "16inch"] as const),
  quantity: z.coerce.number().min(1).max(100),
  eventName: z.string().optional(),
});

// Extract the inferred type from the schema
type BalloonOrderFormValues = z.infer<typeof balloonOrderSchema>;

interface BalloonOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId?: number | null;
  initialColor?: string;
  initialSize?: string;
}

export function BalloonOrderDialog({
  open,
  onOpenChange,
  designId = null,
  initialColor,
  initialSize,
}: BalloonOrderDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default form values
  const defaultValues: Partial<BalloonOrderFormValues> = {
    color: initialColor || "red",
    size: initialSize || "11inch",
    quantity: 10,
    eventName: "",
  };

  // Initialize form with react-hook-form
  const form = useForm<BalloonOrderFormValues>({
    resolver: zodResolver(balloonOrderSchema),
    defaultValues,
  });

  // Handle form submission
  const onSubmit = async (data: BalloonOrderFormValues) => {
    setIsSubmitting(true);

    try {
      // Convert string values to expected types if needed
      const orderData = {
        designId,
        color: data.color,
        size: data.size,
        quantity: data.quantity,
        eventName: data.eventName,
      };

      // Send order to API
      const response = await apiRequest(
        "POST",
        "/api/orders/balloon", 
        orderData
      );

      // Parse the response
      const resultData = await response.json();
      
      // Show success message with details from server
      toast({
        title: "Order Placed! 🎈",
        description: resultData.message || "Your balloon order has been submitted successfully!",
      });
      
      console.log("Order successful, inventory updated:", resultData);
      
      // Force immediate refetch of inventory and orders data
      await queryClient.refetchQueries({ queryKey: ['/api/inventory'] });
      await queryClient.refetchQueries({ queryKey: ['/api/orders'] });
      
      // Also invalidate the queries to ensure any components using stale data get updated
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });

      // Reset form and close dialog
      form.reset(defaultValues);
      onOpenChange(false);

    } catch (error) {
      console.error("Error placing balloon order:", error);
      toast({
        title: "Oops! Something went wrong",
        description: "We couldn't place your balloon order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the balloon emoji based on color
  const getBalloonEmoji = (color: string) => {
    const colorEmojis: Record<string, string> = {
      red: "🔴",
      blue: "🔵",
      green: "🟢",
      yellow: "🟡",
      purple: "🟣",
      pink: "🎀",
      orange: "🟠",
      white: "⚪",
      black: "⚫",
      silver: "🥈",
      gold: "🥇",
    };

    return colorEmojis[color] || "🎈";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Order Balloons <span className="text-2xl">🎈</span>
          </DialogTitle>
          <DialogDescription>
            Tell us what balloons you need for your design.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Color selection */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balloon Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["red", "blue", "green", "yellow", "purple", "pink", "orange", "white", "black", "silver", "gold"].map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <span>{getBalloonEmoji(color)}</span>
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the color of balloons you need.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size selection */}
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balloon Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormDescription>
                    Choose between small (11 inch) or large (16 inch) balloons.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity input */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How Many?</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a number between 1 and 100.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event name (optional) */}
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Birthday Party, Graduation, etc." />
                  </FormControl>
                  <FormDescription>
                    What are these balloons for?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Placing Order..." : "Place Order 🎈"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}