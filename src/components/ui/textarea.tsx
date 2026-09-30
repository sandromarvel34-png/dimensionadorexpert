import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-base transition-all placeholder:text-slate-400 hover:border-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
