import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { vi } from "vitest"

let comboboxItems: string[] = []
let comboboxSelected: string[] = []
let comboboxOnValueChange: ((next: string[]) => void) | null = null

vi.mock("@openlguid/ui/components/button", () => ({
  Button: ({ children, ...props }: { children?: ReactNode } & ComponentPropsWithoutRef<"button">) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock("@openlguid/ui/components/card", () => ({
  Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}))

vi.mock("@openlguid/ui/components/field", () => ({
  Field: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  FieldLabel: ({ children, htmlFor }: { children?: ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  FieldDescription: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  FieldGroup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  FieldSeparator: () => <hr />,
}))

vi.mock("@openlguid/ui/components/input", () => ({
  Input: (props: ComponentPropsWithoutRef<"input">) => <input {...props} />,
}))

vi.mock("@openlguid/ui/components/textarea", () => ({
  Textarea: (props: ComponentPropsWithoutRef<"textarea">) => <textarea {...props} />,
}))

vi.mock("@openlguid/ui/components/date-picker", () => ({
  default: (props: ComponentPropsWithoutRef<"input">) => <input type="date" {...props} />,
}))

vi.mock("@openlguid/ui/components/dialog", () => ({
  Dialog: ({ open, children }: { open?: boolean; children?: ReactNode }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
}))

vi.mock("@openlguid/physical-id-template/preview", () => ({
  PhysicalLGUIDPreview: ({ className }: { className?: string }) => (
    <iframe title="Physical LGU ID preview" className={className} />
  ),
}))

vi.mock("@openlguid/ui/components/avatar", () => ({
  Avatar: ({ children, ...props }: { children?: ReactNode } & ComponentPropsWithoutRef<"div">) => (
    <div {...props}>{children}</div>
  ),
  AvatarImage: ({ ...props }: ComponentPropsWithoutRef<"img">) => <img {...props} />, 
  AvatarFallback: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.mock("@openlguid/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, render }: { children?: ReactNode; render?: ReactNode }) => <div>{render}{children}</div>,
  DropdownMenuContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: { children?: ReactNode } & ComponentPropsWithoutRef<"button">) => (
    <button {...props}>{children}</button>
  ),
  DropdownMenuGroup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}))

vi.mock("@openlguid/ui/components/sidebar", () => ({
  Sidebar: ({ children, ...props }: { children?: ReactNode } & ComponentPropsWithoutRef<'div'>) => (
    <div {...props}>{children}</div>
  ),
  SidebarProvider: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarFooter: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({ children, ...props }: { children?: ReactNode } & ComponentPropsWithoutRef<"button">) => (
    <button {...props}>{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  useSidebar: () => ({ isMobile: false }),
}))

vi.mock("@openlguid/ui/components/combobox", () => ({
  Combobox: ({
    items,
    value = [],
    onValueChange,
    children,
  }: {
    items: string[]
    value?: string[]
    onValueChange?: (next: string[]) => void
    children?: ReactNode
  }) => {
    comboboxItems = items
    comboboxSelected = value
    comboboxOnValueChange = onValueChange ?? null
    return <div>{children}</div>
  },
  ComboboxChip: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  ComboboxChips: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ComboboxChipsInput: (props: ComponentPropsWithoutRef<"input">) => <input {...props} />,
  ComboboxContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ComboboxEmpty: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ComboboxItem: ({ value, children }: { value: string; children?: ReactNode }) => (
    <button
      type="button"
      role="option"
      onClick={() => {
        const next = comboboxSelected.includes(value)
          ? comboboxSelected.filter((item) => item !== value)
          : [...comboboxSelected, value]
        comboboxSelected = next
        comboboxOnValueChange?.(next)
      }}
    >
      {children}
    </button>
  ),
  ComboboxList: ({ children }: { children?: (item: string) => ReactNode }) => (
    <div>{comboboxItems.map((item) => children?.(item))}</div>
  ),
  ComboboxValue: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))
