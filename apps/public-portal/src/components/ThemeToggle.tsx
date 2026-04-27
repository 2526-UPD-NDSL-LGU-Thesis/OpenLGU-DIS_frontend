import { useTheme } from "./theme-provider";

// Components
import { Button } from "@openlguid/ui/components/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Toggle Theme
        </Button>
    )
}
