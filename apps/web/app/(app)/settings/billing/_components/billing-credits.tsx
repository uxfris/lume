import LogoIcon from "@/assets/icons/logo-icon"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Progress } from "@workspace/ui/components/progress"
import { Check } from "lucide-react"

export function BillingCredits() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-3 rounded-lg bg-primary p-4">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-14 w-14 text-primary-foreground" />
          <div>
            <h2 className="text-base font-semibold text-primary-foreground">
              Your're on Free Plan
            </h2>
            <p className="text-sm text-primary-foreground/50">
              Upgrade anytime
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-primary-foreground" />
            <span className="text-sm text-primary-foreground">
              5 meetings/month
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-primary-foreground" />
            <span className="text-sm text-primary-foreground">
              ~13 hours of recording storage
            </span>
          </div>
        </div>
        <ManageBillingDialog />
      </div>
      <div className="flex flex-col gap-6 md:gap-3 lg:col-span-2">
        <div className="h-full space-y-4 rounded-lg bg-card p-4">
          <h3 className="pt-1 text-sm">
            You've used <span className="font-semibold">3 of 5</span> meetings
            this month
          </h3>
          <Progress value={70} className="h-2" />
        </div>
        <div className="h-full space-y-4 rounded-lg bg-card p-4">
          <h3 className="pt-1 text-sm">
            About <span className="font-semibold">6 hours</span> of recording
            space remaining
          </h3>
          <Progress value={60} className="h-2" />
        </div>
      </div>
    </div>
  )
}

export function ManageBillingDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="mt-3 w-full">
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Plan</DialogTitle>
          <DialogDescription>Subscription & billing settings</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
          <LogoIcon className="h-14 w-14" />
          <div>
            <h2 className="font-semibold">Your're on Studio Pro</h2>
            <p className="text-sm text-muted-foreground">
              renews on April 12, 2026
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" className="flex-1">
            Edit billing information
          </Button>
          <Button className="flex-1">Invoice & payments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
