import { cloneElement, isValidElement, type ComponentPropsWithoutRef, type ReactElement } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none " +
  "transition-[transform,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "hover:-translate-y-0.5 active:translate-y-0 " +
  "outline-2 outline-offset-2 outline-transparent focus-visible:outline-navy dark:focus-visible:outline-peach " +
  "disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-peach text-navy shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] hover:shadow-[0_10px_24px_-6px_var(--peach-deep)]",
  secondary: "bg-navy text-cloud hover:shadow-[0_10px_24px_-8px_rgb(15_30_61/0.5)] dark:bg-cloud dark:text-navy",
  ghost: "glass text-fg",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 py-2.5 text-base",
  lg: "min-h-12 px-7 py-3.5 text-lg",
};

type Common = { variant?: ButtonVariant; size?: ButtonSize; asChild?: boolean };
type AnchorProps = Common & ComponentPropsWithoutRef<"a"> & { href: string };
type NativeProps = Common & ComponentPropsWithoutRef<"button"> & { href?: undefined };
export type ButtonProps = AnchorProps | NativeProps;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", asChild, className, ...rest } = props;
  const cls = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (asChild) {
    const { children, ...restProps } = rest as { children?: React.ReactNode };
    if (isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, { ...restProps, className: cn(cls, child.props.className) });
    }
    return <>{children}</>;
  }

  if (typeof rest.href === "string") {
    return <a className={cls} {...(rest as ComponentPropsWithoutRef<"a">)} />;
  }
  const { href: _h, ...btn } = rest as ComponentPropsWithoutRef<"button"> & { href?: undefined };
  void _h;
  return <button type="button" className={cls} {...btn} />;
}
