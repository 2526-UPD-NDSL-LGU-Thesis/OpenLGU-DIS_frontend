import { useTheme } from "@/components/theme-provider";

// Components
import { Button } from "@openlgu-dis/ui/components/button";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Toggle Theme
        </Button>
    )
}
