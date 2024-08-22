import { AuthProvider, MatchmakingProvider } from "@/context";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/constant";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        {" "}
        <MatchmakingProvider>
          {" "}
          <Component {...pageProps} />
        </MatchmakingProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
