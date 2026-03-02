import { Redirect } from "expo-router";

export default function Index() {
    // We can add auth state check here later, for now redirecting to tabs
    return <Redirect href="/(tabs)" />;
}
