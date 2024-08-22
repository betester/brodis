import { saveToken, signIn } from "@/service";
import { Text, VStack, Button, Link } from "@chakra-ui/react";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ILogin } from "@/models";
import { ChakraInput } from "@/component";
import NextLink from "next/link";

export default function Login() {
  const [value, setValue] = useState<ILogin>({ email: "", password: "" });
  const router = useRouter();
  const toast = useToast();

  const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setValue({ ...value, [e.currentTarget.id]: e.currentTarget.value });
  };

  const onSubmit = async () => {
    const session = await signIn(value);

    if (!session) {
      toast({
        position: "top",
        title: `Wrong Credentials`,
        description: "Wrong email or password, please try again",
        status: "error",
        isClosable: true,
      });
    } else {
      saveToken(
        session["access_token"],
        session["refresh_token"],
        session["expires_at"]
      );
      toast({
        position: "top",
        title: `Success`,
        description: "Redirecting in 3 seconds",
        status: "success",
        isClosable: true,
      });

      setTimeout(() => {
        router.replace("/");
      }, 3000);
    }
  };

  return (
    <VStack h="100vh" justifyContent={"center"} gap="2em">
      <Text fontWeight={"bold"} fontSize={"4xl"}>
        Login
      </Text>
      <VStack w={"40%"} gap={"1em"}>
        <ChakraInput
          label={"Email"}
          id={"email"}
          type="email"
          value={value.email}
          onChange={handleOnChange}
        />
        <ChakraInput
          label={"Password"}
          type="password"
          id={"password"}
          value={value.password}
          onChange={handleOnChange}
        />

        <Button
          minW={"100px"}
          alignSelf={"end"}
          bgColor={"blue.500"}
          onClick={onSubmit}
        >
          Login
        </Button>
        <Text>
          Dont have account?{" "}
          <Link color={"blue.200"} as={NextLink} href={"/signup"}>
            Sign Up
          </Link>
        </Text>
      </VStack>
    </VStack>
  );
}
