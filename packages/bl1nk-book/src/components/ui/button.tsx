import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-slate-900 text-white shadow hover:bg-slate-800",
				destructive:
					"bg-red-500 text-white shadow-sm hover:bg-red-600",
				outline:
					"border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700",
				secondary:
					"bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200",
				ghost: "hover:bg-slate-100 text-slate-700",
				link: "text-slate-900 underline-offset-4 hover:underline",
				craft: "bg-[#FF4D00] text-white shadow hover:bg-[#e04500]",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, type, ...props }, ref) => {
         const Comp = asChild ? Slot : "button";
         return (
             <Comp
                 className={cn(buttonVariants({ variant, size, className }))}
                 ref={ref}
                 type={asChild ? undefined : (type ?? "button")}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
