
export async function pingBackend(): Promise<{ message: string; status: number}>{
    const apiBase = import.meta.env.VITE_API_BASE_URL;

    if (!apiBase) {
        return { message: "API URL not configured client side", status: 400 };
    }

    try {
        const response = await fetch(`${apiBase}/api/ping/`, {
            method: "GET"
        })

        if (!response.ok) {
            return {
                message: `Backend responded with status ${response.status}`,
                status: response.status
            }
        }

        const data = await response.json()
    
        return { message: data.message, status: data.status }
    }
    catch (error) {
        console.log(error);
        return {
            message: error.message,
            status: 500
        }
    }
}

