import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BalloonOrderDialog, CheckInventoryButton } from "@/components/balloon";
import { Label } from "@/components/ui/label";

export default function BalloonOrderDemo() {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  
  // Sample material requirements for two different designs
  const sampleDesign1Requirements = {
    red: { small: 12, large: 4 },
    blue: { small: 8, large: 2 },
    white: { small: 10, large: 3 },
  };
  
  const sampleDesign2Requirements = {
    yellow: { small: 15, large: 5 },
    purple: { small: 10, large: 3 },
    pink: { small: 12, large: 4 },
  };

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Balloon Ordering Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates the kid-friendly balloon ordering interface.
          </p>
        </div>

        <Tabs defaultValue="order" className="space-y-4">
          <TabsList>
            <TabsTrigger value="order">Order Balloons</TabsTrigger>
            <TabsTrigger value="check">Check Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="order" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Balloon Order</CardTitle>
                <CardDescription>
                  Place a quick order for the balloons you need.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Click the button below to open the balloon order form.</p>
                <div className="pt-4">
                  <Button onClick={() => setOrderDialogOpen(true)}>
                    Order Balloons 🎈
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>
                  The balloon ordering system is designed to be easy enough for a 5th grader to use.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-[25px_1fr] gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</div>
                    <div>
                      <Label>Choose balloon color</Label>
                      <p className="text-muted-foreground text-sm">
                        Select from various colors with emoji indicators
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[25px_1fr] gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</div>
                    <div>
                      <Label>Select size</Label>
                      <p className="text-muted-foreground text-sm">
                        Choose small (11 inch) or large (16 inch) balloons
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[25px_1fr] gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</div>
                    <div>
                      <Label>Enter quantity</Label>
                      <p className="text-muted-foreground text-sm">
                        How many balloons do you need? (1-100)
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[25px_1fr] gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">4</div>
                    <div>
                      <Label>Submit your order</Label>
                      <p className="text-muted-foreground text-sm">
                        Review and place your balloon order
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="check" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Check Design Inventory</CardTitle>
                <CardDescription>
                  Check if we have enough balloons for your design.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Birthday Party Design</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    This design uses red, blue, and white balloons.
                  </p>
                  <CheckInventoryButton 
                    materialRequirements={sampleDesign1Requirements}
                    buttonText="Check Birthday Design Inventory"
                    variant="outline"
                  />
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-1">Graduation Party Design</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    This design uses yellow, purple, and pink balloons.
                  </p>
                  <CheckInventoryButton 
                    materialRequirements={sampleDesign2Requirements}
                    buttonText="Check Graduation Design Inventory"
                    variant="outline"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  When inventory is low, you'll see a button to order more balloons.
                </p>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status Guide</CardTitle>
                <CardDescription>
                  Learn what the different status indicators mean.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-xl">✅</div>
                  <div>
                    <p className="font-medium">Available</p>
                    <p className="text-sm text-muted-foreground">We have enough balloons in stock</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-xl">⚠️</div>
                  <div>
                    <p className="font-medium">Low Stock</p>
                    <p className="text-sm text-muted-foreground">We have some balloons, but not enough</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-xl">❌</div>
                  <div>
                    <p className="font-medium">Unavailable</p>
                    <p className="text-sm text-muted-foreground">We need to order these balloons</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Order dialog */}
      <BalloonOrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
      />
    </div>
  );
}