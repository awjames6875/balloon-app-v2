import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentIntents, completePaymentIntent, createMockPaymentIntent } from "@/lib/payments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");

  // Fetch payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: getPaymentIntents,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (data: { amount: number; clientName: string }) =>
      createMockPaymentIntent(data.amount, undefined, data.clientName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Payment created",
        description: "The payment intent has been created successfully.",
      });
      setAmount("");
      setClientName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Complete payment mutation
  const completePaymentMutation = useMutation({
    mutationFn: (id: string) => completePaymentIntent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Payment completed",
        description: "The payment has been marked as completed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to complete payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreatePayment = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      amount: parseFloat(amount),
      clientName: clientName || "Unknown Client",
    });
  };

  const handleCompletePayment = (id: string) => {
    completePaymentMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Payments</h1>
        <p className="text-secondary-500 mt-1">Manage your balloon design payments</p>
      </div>

      {/* Create new payment */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Payment</CardTitle>
          <CardDescription>Create a new payment for a client order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500">$</span>
                <Input
                  id="amount"
                  placeholder="100.00"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="client">Client Name</Label>
              <Input
                id="client"
                placeholder="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <Button 
                onClick={handleCreatePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full md:w-auto"
              >
                {createPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                    <TableCell>{payment.clientName}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      {payment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompletePayment(payment.id)}
                          disabled={completePaymentMutation.isPending}
                        >
                          {completePaymentMutation.isPending && completePaymentMutation.variables === payment.id && (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              No payments found. Create a new payment to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}