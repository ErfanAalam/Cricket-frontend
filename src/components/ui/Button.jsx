import { cn } from "/src/lib/utils"

export default function Button({
  children, className, ...props
}) {
  return (
    <button
      className={cn("bg-blue-800 hover:bg-blue-900 text-white w-fit h-fit py-2 px-4 rounded-lg cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
}
